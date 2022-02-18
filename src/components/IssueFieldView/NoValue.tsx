import type { FC } from "react";
import { useDeskproAppTheme } from "@deskpro/app-sdk";

export const NoValue: FC = () => {
    const { theme } = useDeskproAppTheme();
    return (<span style={{ color: theme.colors.grey40 }}>None</span>);
};
