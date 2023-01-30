import { DeskproAppProvider } from "@deskpro/app-sdk";
import * as React from "react";
import { Main } from "./pages/Main";

function App() {
  return (
    <DeskproAppProvider>
      <Main/>
    </DeskproAppProvider>
  );
}

export default App;
