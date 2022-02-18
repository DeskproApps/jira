import type { ReactNode } from "react";
import type { IssueMeta } from "../../types";
import { FieldType } from "../../types";
import { match } from "ts-pattern";
import { RequestLanguageField } from "./CustomField/RequestLanguageField";
import { PlainTextField } from "./CustomField/PlainTextField";
import { ParagraphField } from "./CustomField/ParagraphField";
import { DateField } from "./CustomField/DateField";
import { DateTimeField } from "./CustomField/DateTimeField";
import { CheckboxesField } from "./CustomField/CheckboxesField";
import { LabelsField } from "./CustomField/LabelsField";
import { NumberField } from "./CustomField/NumberField";
import { RadioButtonsField } from "./CustomField/RadioButtonsField";
import { SelectMultiField } from "./CustomField/SelectMultiField";
import { SelectSingleField } from "./CustomField/SelectSingleField";
import { UrlField } from "./CustomField/UrlField";
import { UserPickerField } from "./CustomField/UserPickerField";

export default (meta: IssueMeta, value: unknown): ReactNode => match<FieldType, ReactNode>(meta.type)
    .with(FieldType.REQUEST_LANG, () => <RequestLanguageField meta={meta} value={value} />)
    .with(FieldType.TEXT_PLAIN, () => <PlainTextField meta={meta} value={value} />)
    .with(FieldType.TEXT_PARAGRAPH, () => <ParagraphField meta={meta} value={value} />)
    .with(FieldType.DATE, () => <DateField meta={meta} value={value} />)
    .with(FieldType.DATETIME, () => <DateTimeField meta={meta} value={value} />)
    .with(FieldType.CHECKBOXES, () => <CheckboxesField meta={meta} value={value} />)
    .with(FieldType.LABELS, () => <LabelsField meta={meta} value={value} />)
    .with(FieldType.NUMBER, () => <NumberField meta={meta} value={value} />)
    .with(FieldType.RADIO_BUTTONS, () => <RadioButtonsField meta={meta} value={value} />)
    .with(FieldType.SELECT_MULTI, () => <SelectMultiField meta={meta} value={value} />)
    .with(FieldType.SELECT_SINGLE, () => <SelectSingleField meta={meta} value={value} />)
    .with(FieldType.URL, () => <UrlField meta={meta} value={value} />)
    .with(FieldType.USER_PICKER, () => <UserPickerField meta={meta} value={value} />)
    .otherwise(() => {
        console.warn(`Could not render field view, mapping missing for JIRA field type ${meta.type}`);
        return <></>;
    })
;
