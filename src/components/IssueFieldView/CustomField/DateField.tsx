import type { FC } from "react";
import type { MappedViewProps } from "../types";
import { P5 } from "@deskpro/deskpro-ui";
import { NoValue } from "../NoValue";

export const DateField: FC<MappedViewProps> = ({ value }: MappedViewProps) => (value
    ? <P5>{new Date(value).toLocaleDateString()}</P5>
    : <NoValue />
);
