import { P5 } from "@deskpro/deskpro-ui";
import type { FC } from "react";
import type { MappedViewProps } from "../types";
import { NoValue } from "../NoValue";

export const DateTimeField: FC<MappedViewProps> = ({ value }: MappedViewProps) => (value
    ? <P5>{new Date(value).toLocaleDateString()} {new Date(value).toLocaleTimeString()}</P5>
    : <NoValue />
);
