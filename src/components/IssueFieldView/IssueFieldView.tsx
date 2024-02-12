import type { FC } from "react";
import { IssueMeta } from "../../types";
import { Property } from "@deskpro/app-sdk";
import map from "./map";

interface IssueFieldViewProps {
    meta: IssueMeta;
    value: any;
}

export const IssueFieldView: FC<IssueFieldViewProps> = ({ value, meta }: IssueFieldViewProps) => {
    const field = map(meta, value);

    if (field === null) {
        // Inform us of the missing map then gracefully do not attempt to render the field
        // eslint-disable-next-line no-console
        console.warn(`Could not render field view, mapping missing for JIRA field type ${meta.type}`);
        return (<></>);
    }

    return (
        <Property label={meta.name} text={field}/>
    );
};
