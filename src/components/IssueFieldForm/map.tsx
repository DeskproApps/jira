import type { FC } from "react";
import { FieldType, IssueMeta } from "../../types";
import { match } from "ts-pattern";
import type { MappedFieldProps } from "./types";
import { FormikField } from "@deskpro/app-sdk";
import { PlainTextField } from "./CustomField/PlainTextField";
import { DateTimeField } from "./CustomField/DateTimeField";
import { ParagraphField } from "./CustomField/ParagraphField";
import { DateField } from "./CustomField/DateField";
import { CheckboxesField } from "./CustomField/CheckboxesField";
import { LabelsField } from "./CustomField/LabelsField";
import { NumberField } from "./CustomField/NumberField";
import { RadioButtonsField } from "./CustomField/RadioButtonsField";
import { SelectMultiField } from "./CustomField/SelectMultiField";
import { SelectSingleField } from "./CustomField/SelectSingleField";
import {UrlField} from "./CustomField/UrlField";
import {UserPickerField} from "./CustomField/UserPickerField";

type MaybeField = FC<MappedFieldProps> | null;

const map = (type: FieldType): MaybeField => match<FieldType, MaybeField>(type)
    .with(FieldType.TEXT_PLAIN, () => PlainTextField)
    .with(FieldType.TEXT_PARAGRAPH, () => ParagraphField)
    .with(FieldType.DATETIME, () => DateTimeField)
    .with(FieldType.DATE, () => DateField)
    .with(FieldType.CHECKBOXES, () => CheckboxesField)
    .with(FieldType.LABELS, () => LabelsField)
    .with(FieldType.NUMBER, () => NumberField)
    .with(FieldType.RADIO_BUTTONS, () => RadioButtonsField)
    .with(FieldType.SELECT_MULTI, () => SelectMultiField)
    .with(FieldType.SELECT_SINGLE, () => SelectSingleField)
    .with(FieldType.URL, () => UrlField)
    .with(FieldType.USER_PICKER, () => UserPickerField)
    .otherwise(() => null)
;

interface CustomFieldProps {
    meta: IssueMeta;
    apiErrors: Record<string, string>;
    extraLabels?: string[];
}

export const CustomField: FC<CustomFieldProps> = ({ meta, apiErrors, extraLabels }: CustomFieldProps) => {
    const Field = map(meta.type);

    if (!Field) {
        return (<></>);
    }

    return (
        <div className="create-form-field">
            <FormikField<any> name={`customFields.${meta.key}`}>
                {([field, , helpers], { id, error }) => (
                    <Field
                        id={id}
                        meta={meta}
                        field={field}
                        extraLabels={extraLabels}
                        error={!! (error || apiErrors[meta.name] || apiErrors[meta.key])}
                        helpers={helpers}
                    />
                )}
            </FormikField>
        </div>
    );
};
