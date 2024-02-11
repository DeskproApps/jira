import {FC, SyntheticEvent} from "react";
import { Input, Label } from "@deskpro/deskpro-ui";
import { MappedFieldProps } from "../types";

export const NumberField: FC<MappedFieldProps> = ({ id, meta, field, error }: MappedFieldProps) => {
    const onInput = (e: SyntheticEvent<HTMLInputElement>) => {
        e.currentTarget.value = e.currentTarget.value.replace(/[^\d.]/g, '');
    };

    return (
        <Label
            htmlFor={id}
            label={meta.name}
            error={error}
        >
            <Input id={id} {...field} variant="inline" placeholder="Add value" onInput={onInput} />
        </Label>
    );
};
