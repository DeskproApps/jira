import { FC } from "react";
import { Input, Label } from "@deskpro/deskpro-ui";
import { MappedFieldProps } from "../types";

export const PlainTextField: FC<MappedFieldProps> = ({ id, meta, field, error }: MappedFieldProps) => (
    <Label
        htmlFor={id}
        label={meta.name}
        error={error}
    >
        <Input id={id} {...field} variant="inline" placeholder="Add value" />
    </Label>
);
