import type { FC } from "react";
import type { MappedViewProps } from "../types";
import { NoValue } from "../NoValue";
import { P5 } from "@deskpro/deskpro-ui";
import { Link, LinkIcon } from "@deskpro/app-sdk";
import { nbsp } from "../../../constants";

export const UrlField: FC<MappedViewProps> = ({ value }: MappedViewProps) => {
    if (!value) {
        return (<NoValue />);
    }

    return (
        <P5>
            <Link href={value}>{value}</Link>
            {nbsp}
            <LinkIcon href={value} />
        </P5>
    );
};
