import {DeskproAppProvider} from "@deskpro/app-sdk";
import { StoreProvider } from "./context/StoreProvider/StoreProvider";
import { Main } from "./pages/Main";

import "flatpickr/dist/themes/light.css";
import "tippy.js/dist/tippy.css";
import "simplebar/dist/simplebar.min.css";

import "@deskpro/deskpro-ui/dist/deskpro-ui.css";
import "@deskpro/deskpro-ui/dist/deskpro-custom-icons.css";

import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";

TimeAgo.addDefaultLocale(en)

const App = () => {
  return (
    <DeskproAppProvider>
      <StoreProvider>
        <Main />
      </StoreProvider>
    </DeskproAppProvider>
  );
}

export { App };
