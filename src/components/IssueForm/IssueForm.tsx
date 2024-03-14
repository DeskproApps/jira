import {
  Label,
  Input,
  Stack,
  Button,
  TextArea,
  FormikField,
  DropdownValueType,
} from "@deskpro/deskpro-ui";
import {
  HorizontalDivider,
  LoadingSpinner,
  useDeskproLatestAppContext,
  useQueryWithClient,
} from "@deskpro/app-sdk";
import { Formik, FormikHelpers } from "formik";
import { orderBy, uniq } from "lodash";
import { FC, useEffect, useState } from "react";
import { IntlProvider } from "react-intl";
import {
  buildCustomFieldMeta,
  getCreateMeta,
  getLabels,
  getUsers,
} from "../../context/StoreProvider/api";
import { useStore } from "../../context/StoreProvider/hooks";
import { AttachmentFile } from "../../context/StoreProvider/types/types";
import { FieldType, IssueMeta } from "../../types";
import { isNeedField, isRequiredField } from "../../utils";
import { AttachmentsField } from "../AttachmentsField/AttachmentsField";
import { DropdownMultiSelect } from "../DropdownMultiSelect/DropdownMultiSelect";
import { DropdownSelect } from "../DropdownSelect/DropdownSelect";
import { ErrorBlock } from "../Error/ErrorBlock";
import { FormMapping } from "../FormMapping/FormMapping";
import { CustomField } from "../IssueFieldForm/map";
import { SubtaskDropdownWithSearch } from "../SubtaskDropdownWithSearch/SubtaskDropdownWithSearch";
import "./IssueForm.css";
import { JiraIssueType, JiraProject, JiraUser } from "./types";
import { CreateMeta } from "../../context/StoreProvider/types/createMeta";

export interface IssueFormProps {
  onSubmit: (
    values: any,
    formikHelpers: FormikHelpers<any>,
    meta: Record<string, IssueMeta>
  ) => void | Promise<any>;
  type: "create" | "update";
  apiErrors: Record<string, string>;
  values?: any;
  loading?: boolean;
  editMeta?: Record<string, IssueMeta>;
  issueKey?: string;
}

export const IssueForm: FC<IssueFormProps> = ({
  onSubmit,
  values,
  type,
  apiErrors,
  editMeta,
  issueKey,
  loading = false,
}: IssueFormProps) => {
  const [state, dispatch] = useStore();
  const [mappedFields, setMappedFields] = useState<string[]>([]);
  const [defaultValues, setDefaultValues] = useState<any>({});
  const { context } = useDeskproLatestAppContext();

  const hasMappedFields = mappedFields.length > 0;

  const createMetaQuery = useQueryWithClient(["createMeta"], (client) => {
    return getCreateMeta(client);
  });
  const usersQuery = useQueryWithClient(["users"], (client) =>
    getUsers(client)
  );

  const labelsQuery = useQueryWithClient(["labels"], (client) =>
    getLabels(client)
  );

  useEffect(() => {
    if (!context) return;
    const data = JSON.parse(context?.settings.mapping ?? "{}");

    if (!data) return;
    setMappedFields(data.detailView ?? []);
    setDefaultValues({ project: data.project, issuetype: data.issuetype });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context]);

  if ([createMetaQuery, usersQuery, labelsQuery].some((e) => e.isLoading)) {
    return <LoadingSpinner />;
  }

  const extraLabels: string[] = [];

  if (values && editMeta) {
    const labelFields = Object.values(editMeta).filter(
      (meta) => meta.type === FieldType.LABELS
    );
    const labels = labelFields
      .map((meta) => values.customFields[meta.key] ?? null)
      .filter((l) => !!l);

    labels.forEach((labels) =>
      labels.forEach((l: string) => extraLabels.push(l))
    );
  }

  const initialSummary = state?.context?.settings
    .ticket_subject_as_issue_summary
    ? `[Ticket #${state?.context?.data.ticket.id}] ${state?.context?.data.ticket.subject}`
    : "";
  const initialValues = values ?? {
    summary: initialSummary,
    description: "",
    issuetype: (type === "create" ? defaultValues.issuetype : null) ?? "",
    project: (type === "create" ? defaultValues.project : null) ?? "",
    reporter: "",
    assignee: "",
    labels: [],
    priority: "",
    customFields: {},
    attachments: [],
  };

  const projects = orderBy(
    createMetaQuery.data?.projects ?? [],
    (t) => t.name.toLowerCase(),
    ["asc"]
  );

  const users = orderBy(usersQuery.data ?? [], (u: JiraUser) => u.displayName, [
    "asc",
  ]);

  const projectOptions = projects.map((project: JiraProject, idx: number) => ({
    key: `${idx}`,
    label: `${project.name} (${project.key})`,
    value: project.id,
    type: "value" as const,
  })) as DropdownValueType<any>[];

  const userOptions = users
    .filter((u: JiraUser) => u.active)
    .filter((u: JiraUser) => u.accountType === "atlassian")
    .map((user: JiraUser, idx: number) => ({
      key: `${idx}`,
      label: `${user.displayName}`,
      value: user.accountId,
      type: "value" as const,
    })) as DropdownValueType<any>[];

  const buildIssueTypeOptions = (projectId: string) => {
    if (!createMetaQuery.isSuccess) return [];
    const { projects } = createMetaQuery.data as CreateMeta;
    const project =
      (projects ?? []).filter((p: JiraProject) => p.id === projectId)[0] ??
      null;

    if (!project) {
      return [];
    }

    return (project.issuetypes ?? []).map(
      (issueType: JiraIssueType, idx: number) =>
        ({
          key: `${idx}`,
          label: `${issueType.name}`,
          value: issueType.id,
          type: "value" as const,
        } as DropdownValueType<any>)
    );
  };

  const buildLabelOptions = () => {
    const labels = [...(labelsQuery.data ?? []), ...extraLabels];

    return uniq(labels).map(
      (label: string, idx: number) =>
        ({
          key: `${idx}`,
          label: label,
          value: label,
          type: "value" as const,
        } as DropdownValueType<any>)
    );
  };

  const buildPriorityOptions = (projectId: string, issueTypeId: string) => {
    if (!createMetaQuery.isSuccess) return [];
    const { projects } = createMetaQuery.data as CreateMeta;

    const project =
      (projects ?? []).filter((p: JiraProject) => p.id === projectId)[0] ??
      null;

    if (!project) {
      return [];
    }

    const issueType = project.issuetypes.filter(
      (issueType: any) => issueType.id === issueTypeId
    )[0] as JiraIssueType;

    return (issueType.fields?.priority?.allowedValues ?? []).map(
      (priority: any, idx: number) =>
        ({
          key: `${idx}`,
          label: priority.name,
          value: priority.id,
          type: "value" as const,
        } as DropdownValueType<any>)
    );
  };

  const getCustomFields = (
    projectId?: string,
    issueTypeId?: string
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
        (i: JiraIssueType) => i.id === issueTypeId
      )[0] ?? null;
    if (!issueType) {
      return {};
    }

    return buildCustomFieldMeta(issueType.fields);
  };

  const submit = (values: any, helpers: FormikHelpers<any>) => {
    const { labels, priority, assignee, reporter, ...data } = values;
    const isNeed = ((state, projectId, issueTypeId) => {
      return (fieldName: string) => {
        return isNeedField({ state, fieldName, projectId, issueTypeId });
      };
    })(state, values.project, values.issuetype);

    const currentIssueType = createMetaQuery.data?.projects
      .find((e) => e.id === values.project)
      ?.issuetypes.find((e) => e.id === values.issuetype);

    Object.keys(data)
      .filter(
        (e) =>
          e.startsWith("customfield_") || e.toLowerCase().includes("version")
      )
      .forEach((e) => {
        if (
          !["string", "any", "array", "date", "datetime"].includes(
            currentIssueType?.fields[e]?.schema?.type as string
          )
        ) {
          data[e] = { id: data[e] };
          return;
        }
        if (currentIssueType?.fields[e]?.schema?.type === "array") {
          data[e] = data[e].map((e: string) => ({ id: e }));
          return;
        }
      });

    return onSubmit(
      {
        ...data,
        ...(!isNeed("labels") ? {} : { labels }),
        ...(!isNeed("priority") ? {} : { priority }),
        ...(!isNeed("assignee") ? {} : { assignee: assignee }),
        ...(!isNeed("reporter") ? {} : { reporter: reporter }),
      },
      helpers,
      getCustomFields(values.project, values.issuetype)
    );
  };

  if (
    createMetaQuery.isLoading ||
    hasMappedFields === undefined ||
    !createMetaQuery.data
  )
    return <LoadingSpinner />;

  return (
    <IntlProvider locale="en">
      <Formik initialValues={initialValues} onSubmit={submit}>
        {({ values, submitForm, resetForm, errors, submitCount }) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const is = ((state, projectId, issueTypeId) => {
            return (fieldName: string) => {
              return isNeedField({ state, fieldName, projectId, issueTypeId });
            };
          })(state, values.project, values.issuetype);

          const isRequired = (
            (state, projectId, issueTypeId) => (fieldName: string) => {
              return isRequiredField({
                state,
                fieldName,
                projectId,
                issueTypeId,
              });
            }
          )(state, values.project, values.issuetype);

          return (
            <Stack gap={10} vertical>
              {Object.values({ ...errors, ...apiErrors }).length > 0 &&
                submitCount > 0 && (
                  <ErrorBlock
                    text={
                      Object.values({ ...errors, ...apiErrors }) as
                        | string
                        | string[]
                    }
                  />
                )}
              {!hasMappedFields && (
                <>
                  <div className="create-form-field">
                    <FormikField<string> name="project">
                      {([field, , helpers], { id, error }) => (
                        <Label htmlFor={id} label="Project" error={error}>
                          <DropdownSelect
                            disabled={type === "update"}
                            helpers={helpers}
                            options={projectOptions}
                            id={id}
                            placeholder="Select value"
                            value={field.value}
                            containerMaxHeight={350}
                          />
                        </Label>
                      )}
                    </FormikField>
                  </div>
                  {values.project && (
                    <div className="create-form-field">
                      <FormikField<string> name="issuetype">
                        {([field, , helpers], { id, error }) => (
                          <Label htmlFor={id} label="Issue Type" error={error}>
                            <DropdownSelect
                              disabled={type === "update"}
                              helpers={helpers}
                              options={buildIssueTypeOptions(values.project)}
                              id={id}
                              placeholder="Select value"
                              value={field.value}
                            />
                          </Label>
                        )}
                      </FormikField>
                    </div>
                  )}
                  {values.project && isRequired("parent") && (
                    <div className="create-form-field">
                      <FormikField<string> name="parent">
                        {([field, , helpers], { id, error }) => (
                          <Label htmlFor={id} label="Parent" error={error}>
                            <SubtaskDropdownWithSearch
                              projectId={values.project}
                              helpers={helpers}
                              id={id}
                              placeholder="Select value"
                              value={field.value}
                            />
                          </Label>
                        )}
                      </FormikField>
                    </div>
                  )}
                  <div className="create-form-field">
                    <FormikField<string> name="summary">
                      {([field], { id, error }) => (
                        <Label htmlFor={id} label="Summary" error={error}>
                          <Input
                            id={id}
                            {...field}
                            variant="inline"
                            placeholder="Add value"
                          />
                        </Label>
                      )}
                    </FormikField>
                  </div>
                  <div className="create-form-field">
                    <FormikField<string> name="description">
                      {([field], { id, error }) => (
                        <Label htmlFor={id} label="Description" error={error}>
                          <TextArea
                            id={id}
                            {...field}
                            variant="inline"
                            placeholder="Add Value"
                            rows={5}
                            className={`paragraph-field ${
                              field.value ? "has-value" : ""
                            }`}
                          />
                        </Label>
                      )}
                    </FormikField>
                  </div>
                  {is("assignee") && (
                    <div className="create-form-field">
                      <FormikField<string> name="assignee">
                        {([field, , helpers], { id, error }) => (
                          <Label htmlFor={id} label="Assignee" error={error}>
                            <DropdownSelect
                              helpers={helpers}
                              options={userOptions}
                              id={id}
                              placeholder="Select value"
                              value={field.value}
                            />
                          </Label>
                        )}
                      </FormikField>
                    </div>
                  )}
                  {is("reporter") && (
                    <div className="create-form-field">
                      <FormikField<string> name="reporter">
                        {([field, , helpers], { id, error }) => (
                          <Label htmlFor={id} label="Reporter" error={error}>
                            <DropdownSelect
                              helpers={helpers}
                              options={userOptions}
                              id={id}
                              placeholder="Select value"
                              value={field.value}
                            />
                          </Label>
                        )}
                      </FormikField>
                    </div>
                  )}
                  {values.project && values.issuetype && is("priority") && (
                    <div className="create-form-field">
                      <FormikField<string> name="priority">
                        {([field, , helpers], { id, error }) => (
                          <Label htmlFor={id} label="Priority" error={error}>
                            <DropdownSelect
                              helpers={helpers}
                              options={buildPriorityOptions(
                                values.project,
                                values.issuetype
                              )}
                              id={id}
                              placeholder="Select value"
                              value={field.value}
                            />
                          </Label>
                        )}
                      </FormikField>
                    </div>
                  )}
                  <div className="create-form-field">
                    <Label label="Attachments" />
                    <FormikField<AttachmentFile[]> name="attachments">
                      {([field, , helpers]) => (
                        <AttachmentsField
                          onFiles={helpers.setValue}
                          existing={field.value}
                        />
                      )}
                    </FormikField>
                  </div>
                  {is("labels") && (
                    <div className="create-form-field">
                      <FormikField<string[]> name="labels">
                        {([field, , helpers], { id, error }) => (
                          <Label htmlFor={id} label="Labels" error={error}>
                            <DropdownMultiSelect
                              helpers={helpers}
                              options={buildLabelOptions()}
                              id={id}
                              placeholder="Select values"
                              values={field.value}
                            />
                          </Label>
                        )}
                      </FormikField>
                    </div>
                  )}
                  {Object.values(
                    getCustomFields(values.project, values.issuetype)
                  ).map((meta, idx: number) => (
                    <CustomField
                      meta={meta}
                      key={idx}
                      apiErrors={apiErrors}
                      extraLabels={extraLabels}
                    />
                  ))}
                </>
              )}
              {hasMappedFields && (
                <FormMapping
                  mappedFields={mappedFields}
                  dropdownFields={{
                    project: projectOptions,
                    issuetype: buildIssueTypeOptions(values.projectid),
                    user: userOptions,
                    labels: buildLabelOptions(),
                  }}
                  type={type}
                  values={values}
                  createMeta={createMetaQuery.data}
                />
              )}
              {values.project && values.issuetype && (
                <>
                  <HorizontalDivider />
                  <div className="create-form-field">
                    <Stack justify="space-between">
                      <Button
                        text={type === "create" ? "Create" : "Update"}
                        onClick={() => submitForm()}
                        loading={loading}
                      />
                      {type === "update" && issueKey ? (
                        <Button
                          text="Cancel"
                          intent="secondary"
                          onClick={() =>
                            dispatch({
                              type: "changePage",
                              page: "view",
                              params: { issueKey },
                            })
                          }
                        />
                      ) : (
                        <Button
                          text="Reset"
                          intent="secondary"
                          onClick={() => resetForm()}
                        />
                      )}
                    </Stack>
                  </div>
                </>
              )}
            </Stack>
          );
        }}
      </Formik>
    </IntlProvider>
  );
};
