import type { FC } from "react";
import type { MappedViewProps } from "../types";
import { NoValue } from "../NoValue";

export const DateTimeField: FC<MappedViewProps> = ({ value }: MappedViewProps) => (value
    ? <>{new Date(value).toLocaleDateString()} {new Date(value).toLocaleTimeString()}</>
    : <NoValue />
);
