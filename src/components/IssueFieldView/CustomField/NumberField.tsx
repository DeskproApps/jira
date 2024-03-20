import { P5 } from "@deskpro/deskpro-ui";
import type { FC } from "react";
import type { MappedViewProps } from "../types";
import { NoValue } from "../NoValue";

export const NumberField: FC<MappedViewProps> = ({ value }: MappedViewProps) => (value !== null
    ? <P5>{(value).toLocaleString()}</P5>
    : <NoValue />
);
