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
import { JiraField, JiraIssueType, JiraProject, JiraUser, mandatoryFields } from "./types";
import { DropdownSelect } from "../DropdownSelect/DropdownSelect";
import { CreateIssueData } from "../../context/StoreProvider/types";
import { CustomFieldMap } from "../CustomFieldMap/CustomFieldMap";

export interface IssueFormProps {
    onSubmit: (values: any, formikHelpers: FormikHelpers<any>) => void | Promise<any>;
    values?: any;
    loading?: boolean;
    type: "create"|"update";
}

export const IssueForm: FC<IssueFormProps> = ({ onSubmit, values, type, loading = false }: IssueFormProps) => {
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
        const { projects } = state.dataDependencies.createMeta;
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

    const getCustomFields = (projectId?: string, issueTypeId?: string): JiraField[] => {
        const { projects } = state.dataDependencies.createMeta;
        const project = (projects ?? []).filter((p: JiraProject) => p.id === projectId)[0] ?? null;

        if (!project) {
            return [];
        }

        const issueType = (project.issuetypes ?? []).filter((i: JiraIssueType) => i.id === issueTypeId)[0] ?? null;

        if (!issueType) {
            return [];
        }

        const fields = issueType.fields ?? {};

        const required = Object.keys(fields).reduce((all: any[], k: string) => {
            if (fields[k].required) {
                return [...all, fields[k]];
            }

            return all;
        }, []);

        return required.filter((req) => !mandatoryFields.includes(req.key));
    };

    return (
        <IntlProvider locale="en">
            <Formik
                initialValues={initialValues}
                onSubmit={onSubmit}
                validationSchema={schema}
            >
                {({ values, submitForm, resetForm, errors, submitCount }) => (
                    <Stack gap={10} vertical>
                        {Object.values(errors).length > 0 && submitCount > 0 && <ErrorBlock text={Object.values(errors) as string|string[]} />}
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
                                            className="description-field"
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
                        {getCustomFields(values.projectId, values.issueTypeId).map((jiraField, idx: number) => (
                            <div className="create-form-field" key={idx}>
                                <FormikField<any> name={`customFields.${jiraField.key}`}>
                                    {([field, , helpers], { id, error }) => (
                                        <CustomFieldMap
                                            id={id}
                                            error={error}
                                            jiraField={jiraField}
                                            formikField={field}
                                            helpers={helpers}
                                        />
                                    )}
                                </FormikField>
                            </div>
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
