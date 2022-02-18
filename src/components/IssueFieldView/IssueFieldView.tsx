import type { FC } from "react";
import { IssueMeta } from "../../types";
import map from "./map";
import {Property} from "@deskpro/app-sdk";

interface IssueFieldViewProps {
    meta: IssueMeta;
    value: any;
}

export const IssueFieldView: FC<IssueFieldViewProps> = ({ value, meta }: IssueFieldViewProps) => (
    <Property title={meta.name}>
        {map(meta, value)}
    </Property>
);
