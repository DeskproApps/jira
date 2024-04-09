import { lightTheme, ThemeProvider } from "@deskpro/deskpro-ui";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react/";
import * as Api from "../../../src/api/api";
import React from "react";
import { CreateObject } from "../../../src/pages/Create/Object";

const renderPage = () => {
  return render(
    <ThemeProvider theme={lightTheme}>
      <CreateObject />
    </ThemeProvider>,
  );
};

jest.mock("../../../src/hooks/hooks.tsx", () => {
  return {
    useLinkIssues: () => ({
      getLinkedIssues: async () => {},
      setLinkedIssues: () => {},
    }),
  };
});

jest.mock("../../../src/api/api", () => {
  return {
    createIssue: jest.fn(),
    getUsers: () => [{ displayName: "David" }],
    getLabels: () => ["Label"],
    getCreateMeta: () => ({
      projects: [
        {
          id: 1,
          issuetypes: [
            {
              id: 1,
              fields: {
                summary: { required: true, schema: { type: "string" } },
                description: { required: true, schema: { type: "string" } },
                project: { required: true, schema: { type: "string" } },
                reporter: { required: true, schema: { type: "string" } },
                issuetype: { required: true, schema: { type: "string" } },
              },
            },
          ],
        },
      ],
    }),
  };
});

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

describe("Create issue", () => {
  test("Creating a issue should work correctly", async () => {
    const { getByTestId } = renderPage();

    fireEvent.change(getByTestId("input-firstname"), {
      target: { value: "David" },
    });

    fireEvent.change(getByTestId("input-lastname"), {
      target: { value: "Something" },
    });

    fireEvent.change(getByTestId("input-emailaddress1"), {
      target: { value: "something@something.com" },
    });

    fireEvent.click(getByTestId("button-submit"));

    await waitFor(() => {
      expect(Api.createIssue).toHaveBeenCalledTimes(1);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();

    cleanup();
  });
});
