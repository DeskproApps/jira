import type { FC } from "react";
import { IssueMeta } from "../../types";
import map from "./map";
import {Property} from "@deskpro/app-sdk";

interface IssueFieldViewProps {
    meta: IssueMeta;
    value: any;
}

export const IssueFieldView: FC<IssueFieldViewProps> = ({ value, meta }: IssueFieldViewProps) => {
    const Field = map[meta.type];

    if (!Field) {
        // If no field is mapped, warn us and gracefully render nothing
        console.warn(`Could not render view field, mapping missing for JIRA field type ${meta.type}`);
        return (<></>);
    }

    return (
        <Property title={meta.name}>
            <Field meta={meta} value={value} />
        </Property>
    );
};
