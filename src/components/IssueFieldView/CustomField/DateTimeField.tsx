import type { FC } from "react";
import type { MappedViewProps } from "../types";
import { P5 } from "@deskpro/deskpro-ui";
import { NoValue } from "../NoValue";
import { nbsp } from "../../../constants";

export const DateTimeField: FC<MappedViewProps> = ({ value }: MappedViewProps) => (value
    ? (
      <P5>
        {new Date(value).toLocaleDateString()}
        {nbsp}
        {new Date(value).toLocaleTimeString()}
      </P5>
    )
    : <NoValue />
);
