import { FC } from "react";
import { DropdownValueType, Label } from "@deskpro/app-sdk";
import { MappedFieldProps } from "../types";
import { DropdownSelect } from "../../DropdownSelect/DropdownSelect";
import { FieldType } from "../../../types";

export const SelectSingleField: FC<MappedFieldProps> = ({ id, meta, field, error, helpers }: MappedFieldProps) => {
    if (meta.type !== FieldType.SELECT_SINGLE) {
        return (<></>);
    }

    const options = meta?.allowedValues ?? [];

    return (
        <Label
            htmlFor={id}
            label={meta.name}
            error={error}
        >
            <DropdownSelect
                helpers={helpers}
                options={options.map((option, idx: number) => ({
                    key: `${idx}`,
                    label: option.value,
                    value: option.id,
                    type: "value" as const
                } as DropdownValueType<any>))}
                id={id}
                placeholder="Select value"
                value={field.value}
            />
        </Label>
    );
};
