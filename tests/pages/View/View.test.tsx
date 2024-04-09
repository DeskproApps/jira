import { lightTheme, ThemeProvider } from "@deskpro/deskpro-ui";
import { cleanup, render, waitFor } from "@testing-library/react/";
import React from "react";
import { ViewObject } from "../../../src/pages/View/Object";

const renderPage = () => {
  return render(
    <ThemeProvider theme={lightTheme}>
      <ViewObject />
    </ThemeProvider>,
  );
};

jest.mock("../../../src/api/api", () => {
  return {
    listLinkedIssues: () => [
      {
        summary: "Issue",
        description: "Issue description",
        key: "123",
        project: "Project",
        status: "Status",
        reporter: "Reporter",
        Epic: "Epic",
      },
    ],
  };
});

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
  useParams: () => ({
    objectName: "Lead",
    objectId: "123",
    objectView: "single",
  }),
}));

describe("View", () => {
  test("View page should show a lead correctly", async () => {
    const { getByText } = renderPage();

    const purchaseTimeframe = await waitFor(() => getByText(/Project/i));

    const jobTitle = await waitFor(() => getByText(/Issue description/i));

    await waitFor(() => {
      [purchaseTimeframe, jobTitle].forEach((el) => {
        expect(el).toBeInTheDocument();
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();

    cleanup();
  });
});
