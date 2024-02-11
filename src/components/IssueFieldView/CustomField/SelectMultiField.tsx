import type { FC } from "react";
import type { MappedViewProps } from "../types";
import { NoValue } from "../NoValue";
import { Pill, Stack } from "@deskpro/deskpro-ui";
import { useDeskproAppTheme } from "@deskpro/app-sdk";

export const SelectMultiField: FC<MappedViewProps> = ({ value }: MappedViewProps) => {
    const { theme } = useDeskproAppTheme();

    const options = (value ?? []);

    if (!options.length) {
        return (<NoValue />);
    }

    return (
        <Stack gap={3}>
            {options.map((option: { value: string }, idx: number) => (
                <Pill label={option.value} textColor={theme.colors.grey100} backgroundColor={theme.colors.grey10} key={idx} />
            ))}
        </Stack>
    );
};
