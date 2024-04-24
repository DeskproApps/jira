import { DeskproAppProvider } from "@deskpro/app-sdk";
import { Routes, Route, HashRouter } from "react-router-dom";
import { queryClient } from "./query";
import {
  QueryClientProvider,
  QueryErrorResetBoundary,
} from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { StoreProvider } from "./context/StoreProvider/StoreProvider";
import { Main } from "./pages/Main";

import "iframe-resizer/js/iframeResizer.contentWindow.js";
import "./App.css";
import "flatpickr/dist/themes/light.css";
import "tippy.js/dist/tippy.css";
import "simplebar/dist/simplebar.min.css";
import "@deskpro/deskpro-ui/dist/deskpro-ui.css";
import "@deskpro/deskpro-ui/dist/deskpro-custom-icons.css";

import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
import { AdminSettings } from "./pages/AdminPage";
import { ErrorFallback } from "./components/ErrorFallback/ErrorFallback";

TimeAgo.addDefaultLocale(en);

function App() {
  return (
    <DeskproAppProvider>
      <HashRouter>
        <QueryClientProvider client={queryClient}>
          <StoreProvider>
            <QueryErrorResetBoundary>
              {({ reset }) => (
                <ErrorBoundary
                  onReset={reset}
                  FallbackComponent={ErrorFallback}
                >
                  <Routes>
                    <Route path="/">
                      <Route index element={<Main />} />
                      <Route path="admin_mapping" element={<AdminSettings />} />
                    </Route>
                  </Routes>
                </ErrorBoundary>
              )}
            </QueryErrorResetBoundary>
          </StoreProvider>
        </QueryClientProvider>
      </HashRouter>
    </DeskproAppProvider>
  );
}

export default App;
