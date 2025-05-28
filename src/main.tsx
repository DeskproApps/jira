import './instrument';
import React from "react";
import ReactDOM from "react-dom/client";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
import { Scrollbar } from "@deskpro/deskpro-ui";
import { DeskproAppProvider } from "@deskpro/app-sdk";
import { App } from "./App";
import "./main.css";
import "simplebar/dist/simplebar.min.css";
import "flatpickr/dist/themes/light.css";
import "simplebar/dist/simplebar.min.css";
import "tippy.js/dist/tippy.css";
import "@deskpro/deskpro-ui/dist/deskpro-custom-icons.css";
import "@deskpro/deskpro-ui/dist/deskpro-ui.css";
import { reactErrorHandler } from '@sentry/react';

TimeAgo.addDefaultLocale(en);

const root = ReactDOM.createRoot(document.getElementById('root') as Element, {
  onRecoverableError: reactErrorHandler(),
});
root.render(
  <React.StrictMode>
    <Scrollbar style={{ height: "100%", width: "100%" }}>
      <DeskproAppProvider>
        <App />
      </DeskproAppProvider>
    </Scrollbar>
  </React.StrictMode>,
);
