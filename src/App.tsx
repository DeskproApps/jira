import { DeskproAppProvider } from "@deskpro/app-sdk";
import { Main } from "./pages/Main";
import "./App.css";

import "@deskpro-product/deskpro-ui/deskpro-ui.css";
import "@deskpro-product/deskpro-ui/deskpro-custom-icons.css";

function App() {
  return (
      <DeskproAppProvider>
        <Main />
      </DeskproAppProvider>
  );
}

export default App;
