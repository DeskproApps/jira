import type { FC } from "react";
import type { MappedViewProps } from "../types";
import { NoValue } from "../NoValue";

export const RadioButtonsField: FC<MappedViewProps> = ({ value }: MappedViewProps) => (value?.value
    ? <>{value?.value}</>
    : <NoValue />
);
