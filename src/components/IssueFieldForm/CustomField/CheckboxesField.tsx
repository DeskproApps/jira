import { FC } from "react";
import { MappedFieldProps } from "../types";
import { FieldType } from "../../../types";
import { Checkbox, Label } from "@deskpro/app-sdk";

export const CheckboxesField: FC<MappedFieldProps> = ({ id, meta, field, error, helpers }: MappedFieldProps) => {
    if (meta.type !== FieldType.CHECKBOXES) {
        return (<></>);
    }

    return (
        <Label
            htmlFor={id}
            label={<div style={{ marginBottom: "3px" }}>{meta.name}</div>}
            error={error}
        >
            {(meta.allowedValues ?? []).map((allowedValue, idx: number) => (
                <Checkbox
                    key={idx}
                    label={allowedValue.value}
                    checked={(field.value ?? []).includes(allowedValue.id)}
                    value={allowedValue.id}
                    onChange={() => {
                        const value = field.value ?? []
                        const checked = value.includes(allowedValue.id);
                        const newValues = value.slice();

                        if (checked) {
                            newValues.splice(newValues.indexOf(allowedValue.id), 1);
                        } else if (!checked) {
                            newValues.push(allowedValue.id);
                        }

                        helpers.setValue(newValues);
                    }}
                    id={allowedValue.id}
                    size={12}
                />
            ))}
        </Label>
    );
};
