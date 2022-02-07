import { FC } from "react";
import { JiraField } from "../IssueForm/types";
import { FieldHelperProps, FieldInputProps } from "formik/dist/types";
import { Input, Label, DateTimePicker, DatePickerInput } from "@deskpro/app-sdk";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { getDateFromValue } from "../../utils";

export interface MappedFieldProps {
    jiraField: JiraField;
    formikField: FieldInputProps<any>;
    helpers: FieldHelperProps<any>;
    id: string;
    error: boolean;
}

export default {
    "text": ({ id, jiraField, formikField, error }) => (
        <Label
            htmlFor={id}
            label={jiraField.name}
            error={error}
        >
            <Input id={id} {...formikField} variant="inline" placeholder="Add value" />
        </Label>
    ),
    "datetime": ({ id, jiraField, formikField, error, helpers }) => (
        <DateTimePicker
            onChange={(dates: any[]) => {
                helpers.setValue(dates[0]);
                helpers.setTouched(true);
            }}
            value={formikField.value && getDateFromValue(formikField.value)}
            render={(_: any, ref: any) => (
                <Label
                    htmlFor={id}
                    label={jiraField.name}
                    error={error}
                    placeholder="Select date/time"
                >
                    <DatePickerInput id={id} inputsize="small" variant="inline" rightIcon={faCalendarAlt} ref={ref} />
                </Label>
            )}
        />
    ),
} as Record<string, FC<MappedFieldProps>>;

