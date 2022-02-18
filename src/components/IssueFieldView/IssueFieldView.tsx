import type { FC } from "react";
import { IssueMeta } from "../../types";
import map from "./map";
import { Property } from "@deskpro/app-sdk";

interface IssueFieldViewProps {
    meta: IssueMeta;
    value: any;
}

export const IssueFieldView: FC<IssueFieldViewProps> = ({ value, meta }: IssueFieldViewProps) => {
    const field = map(meta, value);

    if (field === null) {
        // Inform us of the missing map then gracefully do not attempt to render the field
        console.warn(`Could not render field view, mapping missing for JIRA field type ${meta.type}`);
        return (<></>);
    }

    return (
        <Property title={meta.name}>
            {field}
        </Property>
    );
};
