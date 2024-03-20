import { P5 } from "@deskpro/deskpro-ui";
import type { FC } from "react";
import type { MappedViewProps } from "../types";
import { NoValue } from "../NoValue";

export const PlainTextField: FC<MappedViewProps> = ({ value }: MappedViewProps) => (value
    ? <P5>{value}</P5>
    : <NoValue />
);
