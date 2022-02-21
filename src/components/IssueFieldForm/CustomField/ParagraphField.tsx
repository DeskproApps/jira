import { FC } from "react";
import { Label, TextArea } from "@deskpro/app-sdk";
import { MappedFieldProps } from "../types";

export const ParagraphField: FC<MappedFieldProps> = ({ id, meta, field, error }: MappedFieldProps) => (
    <Label
        htmlFor={id}
        label={meta.name}
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
);
