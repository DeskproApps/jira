import type { FC } from "react";
import type { MappedViewProps } from "../types";
import { P5 } from "@deskpro/deskpro-ui";
import { NoValue } from "../NoValue";

export const RequestLanguageField: FC<MappedViewProps> = ({ value }: MappedViewProps) => (value?.displayName
    ? <P5>{value?.displayName}</P5>
    : <NoValue />
);
