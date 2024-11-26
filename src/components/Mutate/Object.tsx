import {
  useDeskproAppClient,
  useDeskproAppEvents,
  useDeskproLatestAppContext,
  useInitialisedDeskproAppClient,
  useMutationWithClient,
  useQueryWithClient,
} from "@deskpro/app-sdk";
import { Button, DropdownValueType, H1, Stack } from "@deskpro/deskpro-ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ZodTypeAny } from "zod";
import {
  addRemoteLink,
  createIssue,
  getCreateMeta,
  getIssueByKey,
  getLabels,
  getUsers,
  updateIssue,
  getProjectCreateMeta,
  transformFieldMeta,
} from "../../api/api";
import { FieldMeta, IssueFormData, InvalidRequestResponseError } from "../../api/types/types";
import IssueJson from "../../mapping/issue.json";
import { useLinkIssues } from "../../hooks/hooks";
import { getSchema, JiraIssueSchema } from "../../schema/schema";
import {
  jiraIssueToFormValues,
  errorToStringWithoutBraces,
  parseJsonErrorMessage,
  getLayout,
  getFormValuesToData,
} from "../../utils";
import { ErrorBlock } from "../Error/ErrorBlock";
import { FormMapping } from "../FormMapping/FormMapping";
import { LoadingSpinnerCenter } from "../LoadingSpinnerCenter/LoadingSpinnerCenter";
import { JiraProject, JiraUser } from "./types";
import { TicketData, Settings,  } from "../../types";

type Props = {
  objectId?: string;
};

export const MutateObject = ({ objectId }: Props) => {
  const navigate = useNavigate();
  const { client } = useDeskproAppClient();
  const [schema, setSchema] = useState<ZodTypeAny | null>(null);
  const [mappedFields, setMappedFields] = useState<string[]>([]);
  const { context } = useDeskproLatestAppContext<TicketData, Settings>();
  const { linkIssues } = useLinkIssues();

  const isEditMode = !!objectId;

  const {
    formState: { errors },
    handleSubmit,
    setValue,
    watch,
    reset,
  } = useForm<JiraIssueSchema>({
    resolver: zodResolver(schema!),
  });

  const values = watch();

  const objectByIdQuery = useQueryWithClient(
    ["objectByIdQuery", objectId as string],
    (client) => getIssueByKey(client, objectId as string),
    { enabled: isEditMode && !!objectId },
  );

  const usersQuery = useQueryWithClient(["users"], getUsers);

  const createMetaQuery = useQueryWithClient(["createMeta"], getCreateMeta);

  const labelsQuery = useQueryWithClient(["labels"], getLabels);

  const submitMutation = useMutationWithClient((client, values: IssueFormData) => {
    const metaMap = usableFields.map(transformFieldMeta).reduce((acc, meta) => ({ ...acc, [meta.key]: meta }), {});
    return isEditMode
      ? updateIssue(client, objectId, getFormValuesToData(values, metaMap))
      : createIssue(client, getFormValuesToData(values, metaMap));
  });

  useEffect(() => {
    if (!submitMutation.isSuccess || !client || !context) return;

    if (isEditMode) {
      navigate("/view/single/" + objectId);

      return;
    }

    addRemoteLink(
      client,
      submitMutation.data.key,
      context?.data?.ticket.id as string,
      context?.data?.ticket.subject as string,
      context?.data?.ticket.permalinkUrl as string,
    ).then(() => {
      linkIssues([submitMutation?.data?.id]);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isEditMode,
    linkIssues,
    navigate,
    submitMutation.isSuccess,
    client,
    context,
  ]);

  useEffect(() => {
    const data = getLayout(context?.settings?.mapping);

    if (!data.project || !data.issuetype) return;

    setMappedFields(data.detailView ?? []);

    if (isEditMode) return;

    setValue("project", { id: data.project });
    setValue("issuetype", { id: data.issuetype });

    context?.settings.ticket_subject_as_issue_summary &&
      setValue(
        "summary",
        `[Ticket #${context?.data?.ticket.id}] ${context?.data?.ticket.subject}`,
      );
  }, [context, setValue, isEditMode]);

  useEffect(() => {
    if ((values.project && values.issuetype) || !objectByIdQuery.isSuccess)
      return;

    const objectByIdData = objectByIdQuery.data?.fields;

    if (!objectByIdData) return;

    reset({
      project: { id: objectByIdData.project.id },
      issuetype: { id: objectByIdData.issuetype.id },
    });
  }, [
    objectByIdQuery.isSuccess,
    objectByIdQuery.data,
    reset,
    values.project,
    values.issuetype,
  ]);

  useDeskproAppEvents({
    onElementEvent(id) {
      switch (id) {
        case "homeButton":
          navigate("/redirect");

          break;
      }
    },
  });

  useInitialisedDeskproAppClient((client) => {
    client.deregisterElement("addIssue");
    client.deregisterElement("menuButton");
    client.setTitle(`${isEditMode ? "Edit" : "Create"} issue`);
    client.deregisterElement("editButton");
  }, [isEditMode]);

  const projectOptions = (createMetaQuery.data?.projects ?? []).map(
    (project: JiraProject) => ({
      key: project.name,
      label: project.name,
      type: "value",
      value: project.id,
    }),
  ) as DropdownValueType<string>[];

  const users = ((usersQuery.data as JiraUser[]) ?? []).sort((a, b) =>
    a.displayName.localeCompare(b.displayName),
  );

  const userOptions = users
    .filter((u: JiraUser) => u.active)
    .filter((u: JiraUser) => u.accountType === "atlassian")
    .map((user: JiraUser) => ({
      key: user.accountId,
      label: user.displayName,
      type: "value",
      value: user.accountId,
    })) as DropdownValueType<string>[];

  const buildLabelOptions = () => {
    const labels = [...(labelsQuery.data ?? [])];

    return labels
      .filter((e, i) => labels.indexOf(e) === i)
      .map((label: string) => ({
        key: label,
        label,
        type: "value" as const,
        value: label,
      }) as DropdownValueType<string>);
  };

  const issuetypes = useMemo(() => {
    if (!values.project?.id) {
      return [];
    }

    return createMetaQuery.data?.projects.find((e) => {
      return e.id === values.project.id;
    })?.issuetypes;
  }, [values.project?.id, createMetaQuery.data?.projects]);

  const fieldsProjectCreateMeta = useQueryWithClient(
    ["fields", values.project?.id, values.issuetype?.id],
    (client) => getProjectCreateMeta(client, values.project?.id, values.issuetype?.id),
    { enabled: Boolean(values.project?.id) && Boolean(values.issuetype?.id) && !isEditMode },
  );
  const createFieldsMeta = useMemo(() => {
    return fieldsProjectCreateMeta.data?.fields?.reduce<Record<FieldMeta["key"], FieldMeta>>((acc, field) => {
      if (!acc[field.key]) {
        acc[field.key] = field;
      }
      return acc;
    }, {});
  }, [fieldsProjectCreateMeta.data?.fields]);

  const usableFields: FieldMeta[] = useMemo(() => {
    if (
      !values.issuetype?.id ||
      issuetypes?.length === 0 ||
      (isEditMode && !objectByIdQuery.isSuccess)
    ) {
      return [];
    }

    const fieldsObj = isEditMode ? objectByIdQuery.data?.editmeta.fields : createFieldsMeta;

    if (!fieldsObj) return [];

    return [
      ...Object.keys(fieldsObj)
        .filter((fieldKey) => {
            return (mappedFields.length > 0
              ? mappedFields.includes(fieldKey)
              : IssueJson.create.includes(fieldKey) || fieldKey.startsWith("customfield_")) ||
            fieldKey === "summary" ||
            fieldKey === "description" ||
            fieldKey === "reporter" ||
            fieldsObj[fieldKey].required
        })
        .map((fieldObjKey) => ({
          ...(fieldsObj[fieldObjKey] ?? {}),
        })),
    ]
      .filter((field) => {
        return (
          field.key !== "project" &&
          field.key !== "issuetype" &&
          field.name !== "Rank" &&
          !field.schema?.custom?.includes("integration-plugin")
        );
      })
      .sort((a, b) => {
        //prioritize summary
        if (a.key === "summary") return -1;
        if (b.key === "summary") return 1;
        return 0;
      });
  }, [
    values.issuetype?.id,
    issuetypes,
    isEditMode,
    mappedFields,
    objectByIdQuery.isSuccess,
    objectByIdQuery.data?.editmeta?.fields,
    createFieldsMeta,
  ]);

  const usableFieldNames = usableFields.map((field) => field.key);

  const metaMap = useMemo(() => {
    return usableFields.reduce((acc, meta) => ({ ...acc, [meta.key]: meta }), {});
  }, [usableFields]);

  useEffect(() => {
    if (usableFields.length === 0) return;

    setSchema(getSchema(usableFields));
  }, [usableFields]);

  useEffect(() => {
    if (
      !objectByIdQuery.isSuccess ||
      !isEditMode ||
      usableFields.length === 0 ||
      usableFieldNames.length === 0
    )
      return;

    const objectData = objectByIdQuery.data.fields;

    const formattedFields = jiraIssueToFormValues(objectData, usableFields);

    usableFieldNames.forEach((field) => {
      if (
        field === "project" ||
        field === "issuetype" ||
        field === "issuelinks" ||
        field === "comment"
      )
        return;

      setValue(field, formattedFields[field]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectId, objectByIdQuery.isSuccess, isEditMode, usableFields]);

  if ((isEditMode && !objectByIdQuery.isSuccess) || !createMetaQuery.data) {
    return <LoadingSpinnerCenter />;
  }

  return (
    <form
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSubmit={handleSubmit((data) => {
        submitMutation.mutate(data);
      })}
      style={{ width: "100%", minHeight: "400px" }}
    >
      <Stack vertical style={{ width: "100%" }} gap={6}>
        {Object.keys(errors).length > 0 && (
          <ErrorBlock
            text={Object.keys(errors).reduce((acc, curr) => {
              const field = usableFields.find(({ key }) => key === curr);
              acc.push(`${field?.name ?? curr}: ${errors[curr]?.message as string}`);
              return acc;
            }, [] as string[])}
          />
        )}
        {(submitMutation.error && submitMutation.error instanceof InvalidRequestResponseError)  ? (
          <ErrorBlock
            text={`
              ${submitMutation.error?._response?.errorMessages as unknown as string}
              \n
              ${errorToStringWithoutBraces(submitMutation.error?._response?.errors ?? {}, metaMap)}
            `}
          />
        ) : null}
        <FormMapping
          errors={errors}
          values={values}
          usableFields={usableFields}
          dropdownFields={{
            project: projectOptions,
            user: userOptions,
            labels: buildLabelOptions(),
            issuetypes,
          }}
          type={isEditMode ? "update" : "create"}
          setValue={setValue}
          createMeta={createMetaQuery.data}
        />
        {values.project?.id && values.issuetype?.id && (
          <Stack style={{ width: "100%", justifyContent: "space-between" }}>
            <Button
              type="submit"
              data-testid="button-submit"
              text={objectId ? "Save" : "Create"}
              loading={submitMutation.isLoading}
              disabled={submitMutation.isLoading}
              intent="primary"
            />
            {isEditMode && (
              <Button
                text="Cancel"
                onClick={() => navigate(-1)}
                intent="secondary"
              />
            )}
            {!isEditMode && (
              <Button
                text="Reset"
                onClick={() => reset()}
                intent="secondary"
              />
            )}
          </Stack>
        )}
      </Stack>
      <H1>
        {!!submitMutation.error &&
          parseJsonErrorMessage(
            (submitMutation.error as { message: string }).message,
          )}
      </H1>
    </form>
  );
};
