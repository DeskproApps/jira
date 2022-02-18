import type { FC } from "react";
import type { MappedViewProps } from "../types";
import { NoValue } from "../NoValue";

export const RequestLanguageField: FC<MappedViewProps> = ({ value }: MappedViewProps) => (value?.displayName
    ? <>{value?.displayName}</>
    : <NoValue />
);
