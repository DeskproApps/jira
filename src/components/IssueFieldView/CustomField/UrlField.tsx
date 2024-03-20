import { P5 } from "@deskpro/deskpro-ui";
import type { FC } from "react";
import type { MappedViewProps } from "../types";
import { NoValue } from "../NoValue";
import { useDeskproAppTheme } from "@deskpro/app-sdk";
import { ExternalLink } from "../../ExternalLink/ExternalLink";

export const UrlField: FC<MappedViewProps> = ({ value }: MappedViewProps) => {
    const { theme } = useDeskproAppTheme();

    if (!value) {
        return (<NoValue />);
    }

    return (
        <P5>
            <a href={value} target="_blank" style={{ color: theme.colors.cyan100, textDecoration: "none" }} rel="noopener noreferrer">{value}</a>
            <ExternalLink href={value} />
        </P5>
    );
};
