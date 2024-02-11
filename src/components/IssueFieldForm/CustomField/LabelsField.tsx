import { FC } from "react";
import { Label } from "@deskpro/deskpro-ui";
import { MappedFieldProps } from "../types";
import { useStore } from "../../../context/StoreProvider/hooks";
import { DropdownMultiSelect, DropdownMultiSelectValueType } from "../../DropdownMultiSelect/DropdownMultiSelect";
import {uniq} from "lodash";

export const LabelsField: FC<MappedFieldProps> = ({ id, meta, field, error, helpers, extraLabels }: MappedFieldProps) => {
    const [ state ] = useStore();

    if (!state?.dataDependencies?.labels) {
        return (<></>);
    }

    const labels = [
        ...state.dataDependencies.labels ?? [],
        ...extraLabels ?? []
    ];

    return (
        <Label
            htmlFor={id}
            label={meta.name}
            error={error}
        >
            <DropdownMultiSelect
                helpers={helpers}
                options={uniq(labels).map((label: string, idx: number) => ({
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
