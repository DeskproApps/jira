import {
  QueryClientProvider,
  QueryErrorResetBoundary,
} from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { HashRouter, Route, Routes } from "react-router-dom";
import { ErrorFallback } from "./components/ErrorFallback/ErrorFallback";
import { Home as Main } from "./pages/Main";

import "./App.css";
import "flatpickr/dist/themes/light.css";
import "simplebar/dist/simplebar.min.css";
import "tippy.js/dist/tippy.css";
import "iframe-resizer/js/iframeResizer.contentWindow.js";

import {
  LoadingSpinner,
  useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
import "@deskpro/deskpro-ui/dist/deskpro-custom-icons.css";
import "@deskpro/deskpro-ui/dist/deskpro-ui.css";
import { Suspense } from "react";
import { Redirect } from "./components/Redirect/Redirect";
import { queryClient } from "./query";
import { FindOrCreate } from "./pages/FindOrCreate/FindOrCreate";
import { ViewObject } from "./pages/View/Object";
import { CreateObject } from "./pages/Create/Object";
import { EditObject } from "./pages/Edit/Edit";
import { AdminSettings } from "./pages/Admin/Settings";
import { VerifySettings } from "./pages/VerifySettings/VerifySettings";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
import { CreateComment } from "./pages/Create/Comment";

TimeAgo.addDefaultLocale(en);

function App() {
  useInitialisedDeskproAppClient((client) => {
    client.registerElement("refresh", {
      type: "refresh_button",
    });
  });

  return (
    <HashRouter>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<LoadingSpinner />}>
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <ErrorBoundary onReset={reset} FallbackComponent={ErrorFallback}>
                <Routes>
                  <Route path="/">
                    <Route path="redirect" element={<Redirect />} />
                    <Route index element={<Main />} />
                    <Route path="create">
                      <Route path="" element={<CreateObject />} />
                      <Route
                        path="comment/:issueKey"
                        element={<CreateComment />}
                      />
                    </Route>
                    <Route path="edit">
                      <Route path=":objectId" element={<EditObject />} />
                    </Route>
                    <Route path="/findOrCreate" element={<FindOrCreate />} />
                    <Route path="admin_mapping" element={<AdminSettings />} />
                    <Route path="verifySettings" element={<VerifySettings />} />
                    <Route path="view">
                      <Route
                        path=":objectView/:objectId"
                        element={<ViewObject />}
                      />
                    </Route>
                  </Route>
                </Routes>
              </ErrorBoundary>
            )}
          </QueryErrorResetBoundary>
        </Suspense>
      </QueryClientProvider>
    </HashRouter>
  );
}

export default App;
