import { FC } from "react";
import { Formik, FormikHelpers } from "formik";
import {
    FormikField,
    Stack,
    Input,
    TextArea,
    HorizontalDivider,
    Label,
    Button,
    LoadingSpinner,
    DropdownValueType
} from "@deskpro/app-sdk";
import { IntlProvider } from "react-intl";
import "./IssueForm.css";
import { useStore } from "../../context/StoreProvider/hooks";
import { schema } from "./validation";
import { ErrorBlock } from "../Error/ErrorBlock";
import { useLoadDataDependencies } from "../../hooks";
import { orderBy } from "lodash";
import { JiraIssueType, JiraProject, JiraUser } from "./types";
import { DropdownSelect } from "../DropdownSelect/DropdownSelect";
import { CreateIssueData } from "../../context/StoreProvider/types";
import { buildCustomFieldMeta } from "../../context/StoreProvider/api";
import { IssueMeta } from "../../types";
import { CustomField } from "../IssueFieldForm/map";
import {DropdownMultiSelect} from "../DropdownMultiSelect/DropdownMultiSelect";

export interface IssueFormProps {
    onSubmit: (values: any, formikHelpers: FormikHelpers<any>, meta: Record<string, IssueMeta>) => void | Promise<any>;
    values?: any;
    loading?: boolean;
    type: "create"|"update";
    apiErrors: Record<string, string>;
}

export const IssueForm: FC<IssueFormProps> = ({ onSubmit, values, type, apiErrors, loading = false }: IssueFormProps) => {
    const [ state ] = useStore();

    useLoadDataDependencies();

    if (!state.dataDependencies) {
        return (
            <LoadingSpinner />
        );
    }

    const initialValues = values ?? {
        summary: "",
        description: "",
        issueTypeId: "",
        projectId: "",
        reporterUserId: "",
        labels: [],
        priority: "",
        customFields: {},
    } as CreateIssueData;

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
        })) as DropdownValueType<any>[]
    ;

    const buildIssueTypeOptions = (projectId: string) => {
        const { projects } = state.dataDependencies.createMeta; // fixme: can come from editmeta too
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
        const labels = state.dataDependencies.labels ?? [];

        return (labels).map((label: string, idx: number) => ({
            key: `${idx}`,
            label: label,
            value: label,
            type: "value" as const,
        } as DropdownValueType<any>));
    };

    const buildPriorityOptions = (projectId: string, issueTypeId: string) => {
        const {projects} = state.dataDependencies.createMeta; // fixme: can come from editmeta too

        const project = (projects ?? []).filter((p: JiraProject) => p.id === projectId)[0] ?? null;

        if (!project) {
            return [];
        }

        const issueType = project.issuetypes.filter((issueType: any) => issueType.id === issueTypeId)[0] as JiraIssueType;

        return (issueType.fields?.priority.allowedValues ?? []).map((priority: any, idx: number) => ({
            key: `${idx}`,
            label: priority.name,
            value: priority.id,
            type: "value" as const,
        } as DropdownValueType<any>));
    };

    const getCustomFields = (projectId?: string, issueTypeId?: string): Record<string, IssueMeta> => {

        // fixme: if this is an edit form, then we need to use the "editmeta" unless the project and/or issue type is changed

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

    const submit = (values: any, helpers: FormikHelpers<any>) => onSubmit(
        values,
        helpers,
        getCustomFields(values.projectId, values.issueTypeId)
    );

    return (
        <IntlProvider locale="en">
            <Formik
                initialValues={initialValues}
                onSubmit={submit}
                validationSchema={schema}
            >
                {({ values, submitForm, resetForm, errors, submitCount }) => (
                    <Stack gap={10} vertical>
                        {Object.values({...errors, ...apiErrors}).length > 0 && submitCount > 0 && <ErrorBlock text={Object.values({...errors, ...apiErrors}) as string|string[]} />}
                        <div className="create-form-field">
                            <FormikField<string> name="projectId">
                                {([field, , helpers], { id, error }) => (
                                    <Label htmlFor={id} label="Project" error={error}>
                                        <DropdownSelect
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
                        {(values.projectId && values.issueTypeId) && (
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
                        {Object.values(getCustomFields(values.projectId, values.issueTypeId)).map((meta, idx: number) => (
                            <CustomField meta={meta} key={idx} apiErrors={apiErrors} />
                        ))}
                        <HorizontalDivider />
                        <div className="create-form-field">
                            <Stack justify="space-between">
                                <Button text={type === "create" ? "Create" : "Update"} onClick={() => submitForm()} loading={loading} />
                                <Button text="Reset" intent="secondary" onClick={() => resetForm()} />
                            </Stack>
                        </div>
                    </Stack>
                )}
            </Formik>
        </IntlProvider>
    );
};
