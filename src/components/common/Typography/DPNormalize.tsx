import { P5 } from "@deskpro/deskpro-ui";
import styled from "styled-components";
import { dpNormalize } from "./styles";
import { addBlankTargetToLinks } from "../../../utils";
import type { FC, PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  text?: string,
}>;

const Text = styled(P5)`
  width: 100%;

  ${dpNormalize}
`;

const DPNormalize: FC<Props> = ({ text, children }) => !children
  ? (<Text dangerouslySetInnerHTML={{ __html: addBlankTargetToLinks(text || "-") }} />)
  : (<Text>{children}</Text>);

export { DPNormalize };
