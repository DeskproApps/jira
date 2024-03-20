import { P5 } from "@deskpro/deskpro-ui";
import type { FC } from "react";
import type { MappedViewProps } from "../types";
import { NoValue } from "../NoValue";

export const SelectSingleField: FC<MappedViewProps> = ({ value }: MappedViewProps) => (value?.value
    ? <P5>{value?.value}</P5>
    : <NoValue />
);
