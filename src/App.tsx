import { Suspense } from "react";
import {
  QueryClientProvider,
  QueryErrorResetBoundary,
} from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import { ErrorFallback } from "./components/ErrorFallback/ErrorFallback";
import { Home as Main } from "./pages/Main";
import {
  LoadingSpinner,
  useDeskproElements,
  useDeskproLatestAppContext
} from "@deskpro/app-sdk";
import { AdminCallback } from './pages/Admin/Callback';
import { AdminSettings } from "./pages/Admin/Settings";
import { ContextData, ContextSettings } from '@/types/deskpro';
import { CreateComment } from "./pages/Create/Comment";
import { CreateObject } from "./pages/Create/Object";
import { EditObject } from "./pages/Edit/Edit";
import { ErrorBoundary } from "@sentry/react";
import { FindOrCreate } from "./pages/FindOrCreate/FindOrCreate";
import { Initial } from './pages/Initial/Initial';
import { LogIn } from './pages/LogIn/LogIn';
import { queryClient } from "./query";
import { Redirect } from "./components/Redirect/Redirect";
import { VerifySettings } from "./pages/VerifySettings/VerifySettings";
import { ViewObject } from "./pages/View/Object";


export const App = () => {
  const { context } = useDeskproLatestAppContext<ContextData, ContextSettings>();

  useDeskproElements(({ clearElements, registerElement }) => {
    const isUsingOAuth2 = context?.settings.use_advanced_connect === false || context?.settings.use_api_key === false;

    clearElements();
    registerElement('refresh', { type: 'refresh_button' });

    if (isUsingOAuth2) {
      registerElement('menu', {
        type: 'menu',
        items: [{
          title: 'Log Out',
          payload: {
            type: 'logOut'
          }
        }]
      });
    }
  }, [context?.settings.use_advanced_connect, context?.settings.use_api_key]);

  return (
    <HashRouter>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<LoadingSpinner />}>
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <ErrorBoundary onReset={reset} fallback={ErrorFallback}>
                <Routes>
                  <Route path="/">
                    <Route path="redirect" element={<Redirect />} />
                    <Route path='/home' element={<Main />} />
                    <Route path="create">
                      <Route path="" element={<CreateObject />} />
                      <Route path="comment/:issueKey" element={<CreateComment />} />
                    </Route>
                    <Route path="edit">
                      <Route path=":objectId" element={<EditObject />} />
                    </Route>
                    <Route path="/findOrCreate" element={<FindOrCreate />} />
                    <Route path="admin_mapping" element={<AdminSettings />} />
                    <Route path='admin/callback' element={<AdminCallback />} />
                    <Route path='log_in' element={<LogIn />} />
                    <Route path="verifySettings" element={<VerifySettings />} />
                    <Route path="view">
                      <Route path=":objectView/:objectId" element={<ViewObject />} />
                    </Route>
                    <Route index element={<Initial />} />
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