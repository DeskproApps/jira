import { P5 } from "@deskpro/deskpro-ui";
import type { FC } from "react";
import { useDeskproAppTheme } from "@deskpro/app-sdk";

export const NoValue: FC = () => {
    const { theme } = useDeskproAppTheme();
    return (<P5 style={{ color: theme.colors.grey40 }}>None</P5>);
};
