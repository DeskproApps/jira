import { FC } from "react";
import { JiraField } from "../IssueForm/types";
import { FieldHelperProps, FieldInputProps } from "formik/dist/types";
import map from "./map";
import {useStore} from "../../context/StoreProvider/hooks";

export interface CustomFieldMapProps {
    id: string;
    error: boolean;
    jiraField: JiraField;
    formikField: FieldInputProps<any>;
    helpers: FieldHelperProps<any>;
}

export const CustomFieldMap: FC<CustomFieldMapProps> = (props: CustomFieldMapProps) => {
    const [ , dispatch ] = useStore();

    const Field = map[props.jiraField.schema.type];

    if (!Field) {
        dispatch({ type: "failedToGenerateIssueForm" });
        dispatch({ type: "changePage", page: "home" });
        return (<></>);
    }

    return <Field {...props} />;
};
