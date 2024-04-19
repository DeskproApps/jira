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
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodTypeAny } from "zod";
import { useNavigate } from "react-router-dom";

import {
  addRemoteLink,
  buildCustomFieldMeta,
  createIssue,
  getCreateMeta,
  getIssueByKey,
  getLabels,
  getUsers,
  updateIssue,
} from "../../api/api";
import IssueJson from "../../mapping/issue.json";

import { CreateMeta } from "../../api/types/createMeta";
import { useLinkIssues } from "../../hooks/hooks";
import { IssueMeta } from "../../types";
import {
  jiraIssueToFormValues,
  parseJsonErrorMessage,
} from "../../utils/utils";
import { FormMapping } from "../FormMapping/FormMapping";
import { LoadingSpinnerCenter } from "../LoadingSpinnerCenter/LoadingSpinnerCenter";
import { JiraIssueType, JiraProject, JiraUser } from "./types";
import { getSchema } from "../../schema/schema";
import { ErrorBlock } from "../Error/ErrorBlock";
type Props = {
  objectId?: string;
};
export const MutateObject = ({ objectId }: Props) => {
  const navigate = useNavigate();
  const { client } = useDeskproAppClient();
  const [schema, setSchema] = useState<ZodTypeAny | null>(null);
  const [mappedFields, setMappedFields] = useState<string[]>([]);
  const [hasMappedFields, setHasMappedFields] = useState<boolean | undefined>();
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

  const submitMutation = useMutationWithClient(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    (client, values: any) => {
      return isEditMode
        ? updateIssue(
            client,
            objectId,
            {
              ...values,
            },
            getCustomFields(values.project, values.issuetype),
          )
        : createIssue(
            client,
            {
              ...values,
            },
            getCustomFields(values.project, values.issuetype),
          );
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
    ).then(() => linkIssues([submitMutation.data.id as string]));

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

    setHasMappedFields(!!data?.detailView?.length);

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

  const getCustomFields = (
    projectId?: string,
    issueTypeId?: string,
  ): Record<string, IssueMeta> => {
    if (!createMetaQuery.isSuccess) return {};

    const { projects } = createMetaQuery.data as CreateMeta;

    const project =
      (projects ?? []).filter((p: JiraProject) => p.id === projectId)[0] ??
      null;

    if (!project) {
      return {};
    }

    const issueType =
      (project.issuetypes ?? []).filter(
        (i: JiraIssueType) => i.id === issueTypeId,
      )[0] ?? null;
    if (!issueType) {
      return {};
    }

    return buildCustomFieldMeta(issueType.fields);
  };

  const usableFieldNames = useMemo(() => {
    if (
      !createMetaQuery.isSuccess ||
      hasMappedFields === undefined ||
      (isEditMode && !objectByIdQuery.isSuccess)
    )
      return [];

    const editMetaKeys = Object.keys(
      objectByIdQuery.data?.editmeta.fields ?? [],
    );

    const fields = hasMappedFields
      ? mappedFields.filter((e) => editMetaKeys.includes(e))
      : IssueJson.create;

    ["summary", "description", "reporter"].forEach((field) => {
      if (!fields.includes(field)) {
        fields.push(field);
      }
    });

    return fields;
  }, [
    createMetaQuery.isSuccess,
    hasMappedFields,
    isEditMode,
    mappedFields,
    objectByIdQuery.data?.editmeta.fields,
    objectByIdQuery.isSuccess,
  ]);

  const projectOptions = (createMetaQuery.data?.projects ?? []).map(
    (project: JiraProject) => ({
      key: project.name,
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

  const usableFields = useMemo(() => {
    if (
      !values.issuetype?.id ||
      issuetypes?.length === 0 ||
      (isEditMode && !objectByIdQuery.isSuccess)
    )
      return [];

    const fieldsObj = isEditMode
      ? objectByIdQuery.data.editmeta.fields
      : issuetypes?.find((e) => e.id === values.issuetype?.id)?.fields;

    if (!fieldsObj) return [];

    return Object.keys(fieldsObj)
      .filter(
        (e) =>
          mappedFields.includes(e) ||
          e === "summary" ||
          e === "description" ||
          e === "reporter" ||
          fieldsObj[e].required,
      )
      .map((fieldObjKey) => ({
        ...(fieldsObj[fieldObjKey as keyof typeof fieldsObj] ?? {}),
      }))
      .filter((field) => {
        return (
          field.key !== "project" &&
          field.key !== "issuetype" &&
          field.name !== "Rank" &&
          field.name !== "Parent" && //fix
          !field.schema.custom?.includes("integration-plugin")
        );
      })
      .sort((a, b) => {
        //prioritize summary
        if (a.key === "summary") return -1;
        if (b.key === "summary") return 1;
        return 0;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    values.issuetype?.id,
    issuetypes,
    isEditMode,
    objectByIdQuery.isSuccess,
    mappedFields,
  ]);

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
      style={{ width: "100%" }}
    >
      <Stack vertical style={{ width: "100%" }} gap={6}>
        {Object.keys(errors).length > 0 && (
          <ErrorBlock
            text={Object.keys(errors).reduce((acc, curr) => {
              acc.push(`${curr}: ${errors[curr]?.message}`);

              return acc;
            }, [] as string[])}
          />
        )}
        {submitMutation.error ? (
          <ErrorBlock
            text={
              (
                submitMutation.error as {
                  _response: { errorMessages: string[] };
                }
              )._response.errorMessages
            }
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
          mappedFields={usableFieldNames}
        />
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
