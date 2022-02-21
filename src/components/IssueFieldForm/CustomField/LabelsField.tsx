import { FC } from "react";
import { Label } from "@deskpro/app-sdk";
import { MappedFieldProps } from "../types";
import { useStore } from "../../../context/StoreProvider/hooks";
import { DropdownMultiSelect, DropdownMultiSelectValueType } from "../../DropdownMultiSelect/DropdownMultiSelect";

export const LabelsField: FC<MappedFieldProps> = ({ id, meta, field, error, helpers }: MappedFieldProps) => {
    const [ state ] = useStore();

    if (!state?.dataDependencies?.labels) {
        return (<></>);
    }

    const labels = state.dataDependencies.labels ?? [];

    return (
        <Label
            htmlFor={id}
            label={meta.name}
            error={error}
        >
            <DropdownMultiSelect
                helpers={helpers}
                options={labels.map((label: string, idx: number) => ({
                    label,
                    key: `${idx}`,
                    valueLabel: label,
                    value: label,
                    type: "value" as const,
                } as DropdownMultiSelectValueType))}
                id={id}
                placeholder="Select values"
                values={field.value}
            />
        </Label>
    );
};
