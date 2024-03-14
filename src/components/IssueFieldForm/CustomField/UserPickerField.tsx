import { FC } from "react";
import { DropdownValueType, Label } from "@deskpro/deskpro-ui";
import { MappedFieldProps } from "../types";
import { DropdownSelect } from "../../DropdownSelect/DropdownSelect";
import { FieldType } from "../../../types";
import { useStore } from "../../../context/StoreProvider/hooks";
import { JiraUser } from "../../IssueForm/types";

export const UserPickerField: FC<MappedFieldProps> = ({ id, meta, field, error, helpers }: MappedFieldProps) => {
    const [ state ] = useStore();

    if (meta.type !== FieldType.USER_PICKER) {
        return (<></>);
    }

    if (!state?.dataDependencies?.users) {
        return (<></>);
    }

    const users: JiraUser[] = (state.dataDependencies.users ?? [])
        .filter((user: JiraUser) => user.active && user.accountType === "atlassian")
    ;

    return (
        <Label
            htmlFor={id}
            label={meta.name}
            error={error}
        >
            <DropdownSelect
                helpers={helpers}
                options={users.map((user: JiraUser, idx: number) => ({
                    key: `${idx}`,
                    label: user.displayName,
                    value: user.accountId,
                    type: "value" as const
                } as DropdownValueType<any>))}
                id={id}
                placeholder="Select value"
                value={field.value}
            />
        </Label>
    );
};
