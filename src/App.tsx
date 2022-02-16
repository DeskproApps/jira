import { DeskproAppProvider } from "@deskpro/app-sdk";
import { StoreProvider } from "./context/StoreProvider/StoreProvider";
import { Main } from "./pages/Main";
import "./App.css";

import "flatpickr/dist/themes/light.css";
import "notyf/notyf.min.css";
import "tippy.js/dist/tippy.css";
import "simplebar/dist/simplebar.min.css";
import "flag-icon-css/css/flag-icons.min.css";

import "@deskpro/deskpro-ui/dist/deskpro-ui.css";
import "@deskpro/deskpro-ui/dist/deskpro-custom-icons.css";

function App() {
  return (
    <DeskproAppProvider>
      <StoreProvider>
        <Main />
      </StoreProvider>
    </DeskproAppProvider>
  );
}

export default App;
