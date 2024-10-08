/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
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
} from "../../api/api";
import IssueJson from "../../mapping/issue.json";

import { useLinkIssues } from "../../hooks/hooks";
import { getSchema } from "../../schema/schema";
import {
  jiraIssueToFormValues,
  objectToStringWithoutBraces,
  parseJsonErrorMessage,
} from "../../utils/utils";
import { ErrorBlock } from "../Error/ErrorBlock";
import { FormMapping } from "../FormMapping/FormMapping";
import { LoadingSpinnerCenter } from "../LoadingSpinnerCenter/LoadingSpinnerCenter";
import { JiraProject, JiraUser } from "./types";
import { IssueMeta } from "../../types";
type Props = {
  objectId?: string;
};
export const MutateObject = ({ objectId }: Props) => {
  const navigate = useNavigate();
  const { client } = useDeskproAppClient();
  const [schema, setSchema] = useState<ZodTypeAny | null>(null);
  const [mappedFields, setMappedFields] = useState<string[]>([]);
  const { context } = useDeskproLatestAppContext();
  const { linkIssues } = useLinkIssues();

  const isEditMode = !!objectId;

  const {
    formState: { errors },
    handleSubmit,
    setValue,
    watch,
    reset,
  } = useForm<any>({
    resolver: zodResolver(schema!),
  });

  const values = watch();

  const objectByIdQuery = useQueryWithClient(
    ["objectByIdQuery", objectId as string],
    (client) => getIssueByKey(client, objectId as string),

    {
      enabled: isEditMode && !!objectId,
    },
  );

  const usersQuery = useQueryWithClient(["users"], (client) =>
    getUsers(client),
  );

  const createMetaQuery = useQueryWithClient(["createMeta"], (client) => {
    return getCreateMeta(client);
  });

  const labelsQuery = useQueryWithClient(["labels"], (client) =>
    getLabels(client),
  );

  const submitMutation = useMutationWithClient((client, values: any) => {
    return isEditMode
      ? updateIssue(client, objectId, { ...values }, usableFields)
      : createIssue(client, { ...values }, usableFields);
    },
  );

  useEffect(() => {
    if (!submitMutation.isSuccess || !client || !context) return;

    if (isEditMode) {
      navigate("/view/single/" + objectId);

      return;
    }

    addRemoteLink(
      client,
      submitMutation.data.key,
      context?.data.ticket.id as string,
      context?.data.ticket.subject as string,
      context?.data.ticket.permalinkUrl as string,
    ).then(() => {
      linkIssues([submitMutation.data.id as string]);
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
    if (!context) return;
    const data = JSON.parse(context?.settings.mapping ?? "{}");

    if (!data) return;

    setMappedFields(data.detailView ?? []);

    if (isEditMode) return;

    setValue("project", { id: data.project });
    setValue("issuetype", { id: data.issuetype });

    context.settings.ticket_subject_as_issue_summary &&
      setValue(
        "summary",
        `[Ticket #${context?.data.ticket.id}] ${context?.data.ticket.subject}`,
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
    async onElementEvent(id) {
      switch (id) {
        case "homeButton":
          navigate("/redirect");

          break;
      }
    },
  });

  useInitialisedDeskproAppClient(
    (client) => {
      client.deregisterElement("addIssue");

      client.deregisterElement("menuButton");

      client.setTitle(`${isEditMode ? "Edit" : "Create"} issue`);

      client.deregisterElement("editButton");
    },
    [isEditMode],
  );

  const projectOptions = (createMetaQuery.data?.projects ?? []).map(
    (project: JiraProject) => ({
      key: project.name,
      label: project.name,
      type: "value",
      value: project.id,
    }),
  ) as DropdownValueType<any>[];

  const users = ((usersQuery.data as JiraUser[]) ?? []).sort((a, b) =>
    a.displayName.localeCompare(b.displayName),
  );

  const userOptions = users
    .filter((u: JiraUser) => u.active)
    .filter((u: JiraUser) => u.accountType === "atlassian")
    .map((user: JiraUser) => ({
      key: user.displayName,
      label: user.displayName,
      type: "value",
      value: user.accountId,
    })) as DropdownValueType<any>[];

  const buildLabelOptions = () => {
    const labels = [...(labelsQuery.data ?? [])];

    return labels
      .filter((e, i) => labels.indexOf(e) === i)
      .map(
        (label: string) =>
          ({
            key: label,
            label,
            type: "value" as const,
            value: label,
          }) as DropdownValueType<any>,
      );
  };

  const issuetypes = useMemo(() => {
    if (!values.project?.id) return [];
    return createMetaQuery.data?.projects.find(
      (e) => e.id === values.project.id,
    )?.issuetypes;
  }, [values.project?.id, createMetaQuery.data?.projects]);

  const fieldsProjectCreateMeta = useQueryWithClient(
    ["fields", values.project?.id, values.issuetype?.id],
    (client) => getProjectCreateMeta(client, values.project?.id, values.issuetype?.id),
    { enabled: Boolean(values.project?.id) && Boolean(values.issuetype?.id) && !isEditMode },
  );

  const createFieldsMeta = useMemo(() => {
    return fieldsProjectCreateMeta.data?.fields?.reduce<Record<IssueMeta["key"], IssueMeta>>((acc, field) => {
      if (!acc[field.key]) {
        acc[field.key] = field;
      }
      return acc;
    }, {});
  }, [fieldsProjectCreateMeta.data?.fields]);

  const usableFields = useMemo(() => {
    if (
      !values.issuetype?.id ||
      issuetypes?.length === 0 ||
      (isEditMode && !objectByIdQuery.isSuccess)
    ) {
      return [];
    }

    const fieldsObj = isEditMode
      ? objectByIdQuery.data.editmeta.fields
      : createFieldsMeta;

    if (!fieldsObj) return [];

    return [
      ...Object.keys(fieldsObj)
        .filter((e) => {
          return (mappedFields.length > 0
            ? mappedFields.includes(e)
            : IssueJson.create.includes(e) || e.startsWith("customfield_")
          ) ||
          e === "summary" ||
          e === "description" ||
          e === "reporter" ||
          fieldsObj[e].required
        })
        .map((fieldObjKey) => ({
          ...(fieldsObj[fieldObjKey as keyof typeof fieldsObj] ?? {}),
        })),
    ]
      .filter((field) => {
        return (
          field.key !== "project" &&
          field.key !== "issuetype" &&
          field.name !== "Rank" &&
          !field.schema.custom?.includes("integration-plugin")
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

  if ((isEditMode && !objectByIdQuery.isSuccess) || !createMetaQuery.data)
    return <LoadingSpinnerCenter />;

  return (
    <form
      onSubmit={handleSubmit((data) => submitMutation.mutate(data))}
      style={{ width: "100%", minHeight: "400px" }}
    >
      <Stack vertical style={{ width: "100%" }} gap={6}>
        {Object.keys(errors).length > 0 && (
          <ErrorBlock
            text={Object.keys(errors).reduce((acc, curr) => {
              const field = usableFields.find(({ key }) => key === curr);
              acc.push(`${field?.name ?? curr}: ${errors[curr]?.message}`);
              return acc;
            }, [] as string[])}
          />
        )}
        {submitMutation.error ? (
          <ErrorBlock
            text={`${
              (
                submitMutation.error as {
                  _response: { errorMessages: string[] };
                }
              )._response.errorMessages
            } \n ${objectToStringWithoutBraces((submitMutation.error as { _response: { errors: Record<string, string> } })?._response?.errors ?? {})}`}
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
            ></Button>
            {isEditMode && (
              <Button
                text="Cancel"
                onClick={() => navigate(-1)}
                intent="secondary"
              ></Button>
            )}
            {!isEditMode && (
              <Button
                text="Reset"
                onClick={() => reset()}
                intent="secondary"
              ></Button>
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
