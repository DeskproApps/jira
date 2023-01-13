import { render, waitFor } from "@testing-library/react";
import App from "./App";
import * as React from "react";
import fetch from "node-fetch";

jest.mock("@deskpro/app-sdk", () => ({
  ...jest.requireActual("@deskpro/app-sdk"),
  useDeskproAppEvents: (hooks: any, deps: [] = []) => {
    const deskproAppEventsObj = {
      data: {
        ticket: {
          id: 1,
          subject: "Test Ticket",
        },
      },
    };
    React.useEffect(() => {
      hooks.onChange && hooks.onChange(deskproAppEventsObj);
      hooks.onShow && hooks.onShow(deskproAppEventsObj);
      hooks.onReady && hooks.onReady(deskproAppEventsObj);
    }, deps);
  },
  useInitialisedDeskproAppClient: (callback: any) => {
    callback({
      registerElement: () => {},
      deregisterElement: () => {},
    });
  },
  proxyFetch: async () => fetch,
}));

test("renders App component", async () => {
  const { getByText } = render(<App />);

  await waitFor(() => {
    const headingElement = getByText(/Ticket Data/i);
    expect(headingElement).toBeInTheDocument();
  });
});
