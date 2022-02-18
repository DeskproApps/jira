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
        return (<></>); // todo: replace this with something meaningful
    }

    return (
        <Property title={meta.name}>
            <Field meta={meta} value={value} />
        </Property>
    );
};
