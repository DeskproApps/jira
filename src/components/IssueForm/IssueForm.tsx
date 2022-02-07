import { FC } from "react";
import { Formik, FormikHelpers } from "formik";
import {
    FormikField,
    Stack,
    Input,
    TextArea,
    HorizontalDivider,
    Label,
    Button
} from "@deskpro/app-sdk";
import { IntlProvider } from "react-intl";
import "./IssueForm.css";
import { useStore } from "../../context/StoreProvider/hooks";
import { schema } from "./validation";
import { ErrorBlock } from "../Error/ErrorBlock";

export interface IssueFormProps {
    onSubmit: (values: any, formikHelpers: FormikHelpers<any>) => void | Promise<any>;
    values?: any;
    loading?: boolean;
    type: "create"|"update";
}

export const IssueForm: FC<IssueFormProps> = ({ onSubmit, values, type, loading = false }: IssueFormProps) => {
    const [ state ] = useStore();

    // useLoadDataDependencies();

    const initialValues = values ?? {

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
                            <FormikField<string> name="name">
                                {([field], { id, error }) => (
                                    <Label
                                        htmlFor={id}
                                        label="Name"
                                        error={error}
                                    >
                                        <Input id={id} {...field} variant="inline" placeholder="Add value" />
                                    </Label>
                                )}
                            </FormikField>
                        </div>
                        <div className="create-form-field">
                            <FormikField<string> name="description">
                                {([field, meta], { id, error }) => (
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
