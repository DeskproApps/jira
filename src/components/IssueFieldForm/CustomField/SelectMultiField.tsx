import { FC } from "react";
import { Label } from "@deskpro/deskpro-ui";
import { MappedFieldProps } from "../types";
import { DropdownMultiSelect, DropdownMultiSelectValueType } from "../../DropdownMultiSelect/DropdownMultiSelect";
import { FieldType } from "../../../types";

export const SelectMultiField: FC<MappedFieldProps> = ({ id, meta, field, error, helpers }: MappedFieldProps) => {
    if (meta.type !== FieldType.SELECT_MULTI) {
        return (<></>);
    }

    const options = meta?.allowedValues ?? [];

    return (
        <Label
            htmlFor={id}
            label={meta.name}
            error={error}
        >
            <DropdownMultiSelect
                helpers={helpers}
                {...field}
                options={options.map((option, idx: number) => ({
                    label: option.value,
                    key: `${idx}`,
                    valueLabel: option.value,
                    value: option.id,
                    type: "value" as const,
                } as DropdownMultiSelectValueType))}
                placeholder="Select values"
                values={field.value}
            />
        </Label>
    );
};
