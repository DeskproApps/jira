import { FC } from "react";
import { orderBy, uniq } from "lodash";
import { IntlProvider } from "react-intl";
import { Formik, FormikHelpers } from "formik";
import {
    Button,
    DropdownValueType,
    FormikField,
    HorizontalDivider,
    Input,
    Label,
    LoadingSpinner,
    Stack,
    TextArea,
} from "@deskpro/app-sdk";
import "./IssueForm.css";
import { useStore } from "../../context/StoreProvider/hooks";
import { schema } from "./validation";
import { ErrorBlock } from "../Error/ErrorBlock";
import { useLoadDataDependencies } from "../../hooks";
import { JiraIssueType, JiraProject, JiraUser } from "./types";
import { DropdownSelect } from "../DropdownSelect/DropdownSelect";
import {AttachmentFile, IssueFormData} from "../../context/StoreProvider/types";
import { buildCustomFieldMeta } from "../../context/StoreProvider/api";
import { FieldType, IssueMeta } from "../../types";
import { CustomField } from "../IssueFieldForm/map";
import { DropdownMultiSelect } from "../DropdownMultiSelect/DropdownMultiSelect";
import {AttachmentsField} from "../AttachmentsField/AttachmentsField";
import { SubtaskDropdownWithSearch } from "../SubtaskDropdownWithSearch/SubtaskDropdownWithSearch";
import { isNeedField, isRequiredField } from "../../utils";

export interface IssueFormProps {
    onSubmit: (values: any, formikHelpers: FormikHelpers<any>, meta: Record<string, IssueMeta>) => void | Promise<any>;
    type: "create"|"update";
    apiErrors: Record<string, string>;
    values?: any;
    loading?: boolean;
    editMeta?: Record<string, IssueMeta>;
    issueKey?: string;
}

export const IssueForm: FC<IssueFormProps> = ({ onSubmit, values, type, apiErrors, editMeta, issueKey, loading = false }: IssueFormProps) => {
    const [ state, dispatch ] = useStore();

    useLoadDataDependencies();

    if (!state.dataDependencies) {
        return (
            <LoadingSpinner />
        );
    }

    const extraLabels: string[] = [];

    if (values && editMeta) {
        const labelFields = Object.values(editMeta).filter((meta) => meta.type === FieldType.LABELS);
        const labels = labelFields.map((meta) => values.customFields[meta.key] ?? null).filter((l) => !!l);

        labels.forEach((labels) => labels.forEach((l: string) => extraLabels.push(l)));
    }

    const initialSummary = state?.context?.settings.ticket_subject_as_issue_summary
        ? `[Ticket #${state?.context?.data.ticket.id}] ${state?.context?.data.ticket.subject}`
        : ""
    ;

    const initialValues = values ?? {
        summary: initialSummary,
        description: "",
        issueTypeId: "",
        projectId: "",
        reporterUserId: "",
        assigneeUserId: "",
        labels: [],
        priority: "",
        customFields: {},
        attachments: [],
        parentKey: "",
    } as IssueFormData;

    const projects = orderBy(
        state.dataDependencies.projects ?? [],
        (t) => t.name.toLowerCase(),
        ['asc']
    );

    const users = orderBy(
        state.dataDependencies.users ?? [],
        (u: JiraUser) => u.displayName,
        ['asc']
    );

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
        const { projects } =  state.dataDependencies.createMeta;
        const project = (projects ?? []).filter((p: JiraProject) => p.id === projectId)[0] ?? null;

        if (!project) {
            return [];
        }

        return (project.issuetypes ?? []).map((issueType: JiraIssueType, idx: number) => ({
            key: `${idx}`,
            label: `${issueType.name}`,
            value: issueType.id,
            type: "value" as const,
        } as DropdownValueType<any>));
    };

    const buildLabelOptions = () => {
        const labels = [
            ...state.dataDependencies.labels ?? [],
            ...extraLabels,
        ];

        return uniq(labels).map((label: string, idx: number) => ({
            key: `${idx}`,
            label: label,
            value: label,
            type: "value" as const,
        } as DropdownValueType<any>));
    };

    const buildPriorityOptions = (projectId: string, issueTypeId: string) => {
        const { projects } = state.dataDependencies.createMeta;

        const project = (projects ?? []).filter((p: JiraProject) => p.id === projectId)[0] ?? null;

        if (!project) {
            return [];
        }

        const issueType = project.issuetypes.filter((issueType: any) => issueType.id === issueTypeId)[0] as JiraIssueType;

        return (issueType.fields?.priority?.allowedValues ?? []).map((priority: any, idx: number) => ({
            key: `${idx}`,
            label: priority.name,
            value: priority.id,
            type: "value" as const,
        } as DropdownValueType<any>));
    };

    const getCustomFields = (projectId?: string, issueTypeId?: string): Record<string, IssueMeta> => {
        const { projects } = state.dataDependencies.createMeta;
        const project = (projects ?? []).filter((p: JiraProject) => p.id === projectId)[0] ?? null;

        if (!project) {
            return {};
        }

        const issueType = (project.issuetypes ?? [])
            .filter((i: JiraIssueType) => i.id === issueTypeId)[0] ?? null
        ;

        if (!issueType) {
            return {};
        }

        return buildCustomFieldMeta(issueType.fields);
    };

    const submit = (values: any, helpers: FormikHelpers<any>) => {
        const { labels, priority, assigneeUserId, reporterUserId, ...data } = values;
        const isNeed = ((state, projectId, issueTypeId) => {
            return (fieldName: string) => {
                return isNeedField({ state, fieldName, projectId, issueTypeId })
            }
        })(state, values.projectId, values.issueTypeId);

        return onSubmit(
            {
                ...data,
                ...(!isNeed("labels") ? {} : { labels }),
                ...(!isNeed("priority") ? {} : { priority }),
                ...(!isNeed("assignee") ? {} : { assigneeUserId }),
                ...(!isNeed("reporter") ? {} : { reporterUserId })
            },
            helpers,
            getCustomFields(values.projectId, values.issueTypeId)
        )
    };

    return (
        <IntlProvider locale="en">
            <Formik
                initialValues={initialValues}
                onSubmit={submit}
                validationSchema={schema}

            >
                {({ values, submitForm, resetForm, errors, submitCount }) => {
                    const is = ((state, projectId, issueTypeId) => {
                        return (fieldName: string) => {
                            return isNeedField({ state, fieldName, projectId, issueTypeId })
                        }
                    })(state, values.projectId, values.issueTypeId);

                    const isRequired = ((state, projectId, issueTypeId) => (fieldName: string) => {
                        return isRequiredField({ state, fieldName, projectId, issueTypeId })
                    })(state, values.projectId, values.issueTypeId);

                    return (
                        <Stack gap={10} vertical>
                            {Object.values({...errors, ...apiErrors}).length > 0 && submitCount > 0 && <ErrorBlock text={Object.values({...errors, ...apiErrors}) as string|string[]} />}
                            <div className="create-form-field">
                                <FormikField<string> name="projectId">
                                    {([field, , helpers], { id, error }) => (
                                        <Label htmlFor={id} label="Project" error={error}>
                                            <DropdownSelect
                                                disabled={type === "update"}
                                                helpers={helpers}
                                                options={projectOptions}
                                                id={id}
                                                placeholder="Select value"
                                                value={field.value}
                                            />
                                        </Label>
                                    )}
                                </FormikField>
                            </div>
                            {values.projectId && (
                                <div className="create-form-field">
                                    <FormikField<string> name="issueTypeId">
                                        {([field, , helpers], { id, error }) => (
                                            <Label htmlFor={id} label="Issue Type" error={error}>
                                                <DropdownSelect
                                                    disabled={type === "update"}
                                                    helpers={helpers}
                                                    options={buildIssueTypeOptions(values.projectId)}
                                                    id={id}
                                                    placeholder="Select value"
                                                    value={field.value}
                                                />
                                            </Label>
                                        )}
                                    </FormikField>
                                </div>
                            )}
                            {values.projectId && isRequired("parent") && (
                                <div className="create-form-field">
                                    <FormikField<string> name="parentKey">
                                        {([field, , helpers], { id, error }) => (
                                            <Label htmlFor={id} label="Parent" error={error}>
                                                <SubtaskDropdownWithSearch
                                                    projectId={values.projectId}
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
                                        <Label
                                            htmlFor={id}
                                            label="Summary"
                                            error={error}
                                        >
                                            <Input id={id} {...field} variant="inline" placeholder="Add value" />
                                        </Label>
                                    )}
                                </FormikField>
                            </div>
                            <div className="create-form-field">
                                <FormikField<string> name="description">
                                    {([field], { id, error }) => (
                                        <Label
                                            htmlFor={id}
                                            label="Description"
                                            error={error}
                                        >
                                            <TextArea
                                                id={id}
                                                {...field}
                                                variant="inline"
                                                placeholder="Add Value"
                                                rows={5}
                                                className={`paragraph-field ${field.value ? "has-value" : ""}`}
                                            />
                                        </Label>
                                    )}
                                </FormikField>
                            </div>
                            {is("assignee") && (
                                <div className="create-form-field">
                                    <FormikField<string> name="assigneeUserId">
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
                                    <FormikField<string> name="reporterUserId">
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
                            {(values.projectId && values.issueTypeId && is("priority")) && (
                                <div className="create-form-field">
                                    <FormikField<string> name="priority">
                                        {([field, , helpers], { id, error }) => (
                                            <Label htmlFor={id} label="Priority" error={error}>
                                                <DropdownSelect
                                                    helpers={helpers}
                                                    options={buildPriorityOptions(values.projectId, values.issueTypeId)}
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
                                        <AttachmentsField onFiles={helpers.setValue} existing={field.value} />
                                    )}
                                </FormikField>
                            </div>
                            {is("labels") && (
                                <div className="create-form-field">
                                    <FormikField<string[]> name="labels">
                                        {([field, , helpers], { id, error }) => (
                                            <Label
                                                htmlFor={id}
                                                label="Labels"
                                                error={error}
                                            >
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
                            {Object.values(getCustomFields(values.projectId, values.issueTypeId)).map((meta, idx: number) => (
                                <CustomField meta={meta} key={idx} apiErrors={apiErrors} extraLabels={extraLabels} />
                            ))}
                            <HorizontalDivider />
                            <div className="create-form-field">
                                <Stack justify="space-between">
                                    <Button text={type === "create" ? "Create" : "Update"} onClick={() => submitForm()} loading={loading} />
                                    {type === "update" && issueKey ? (
                                        <Button text="Cancel" intent="secondary" onClick={() => dispatch({ type: "changePage", page: "view", params: { issueKey } })} />
                                    ) : (
                                        <Button text="Reset" intent="secondary" onClick={() => resetForm()} />
                                    )}
                                </Stack>
                            </div>
                        </Stack>
                    )
                }}
            </Formik>
        </IntlProvider>
    );
};
