import type { FC } from "react";
import type { MappedViewProps } from "../types";
import { NoValue } from "../NoValue";

export const NumberField: FC<MappedViewProps> = ({ value }: MappedViewProps) => (value !== null
    ? <>{(value).toLocaleString()}</>
    : <NoValue />
);
