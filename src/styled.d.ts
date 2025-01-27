// styled.d.ts
import "styled-components";
import type { DeskproTheme } from "@deskpro/deskpro-ui";

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends DeskproTheme {};
};