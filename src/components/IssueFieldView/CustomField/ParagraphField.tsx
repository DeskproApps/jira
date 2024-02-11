import type { FC } from "react";
import type { MappedViewProps } from "../types";
import { P5 } from "@deskpro/deskpro-ui";
import { NoValue } from "../NoValue";
import { useAdfToPlainText } from "../../../hooks";

export const ParagraphField: FC<MappedViewProps> = ({ value }: MappedViewProps) => {
    const sdfToPlainText = useAdfToPlainText();
    return (value
        ? <P5>{sdfToPlainText(value)}</P5>
        : <NoValue />
    );
};
