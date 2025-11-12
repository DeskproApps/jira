/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { lightTheme } from "@deskpro/deskpro-ui";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { MapFieldValues } from "./MapFieldValues";

function renderFieldValues(issue: unknown, useableFields: unknown) {

  return render(
    <ThemeProvider theme={lightTheme}>
      <MapFieldValues
        issue={issue as any}
        usableFields={useableFields as any}
      />
    </ThemeProvider>
  )
}

jest.mock("@deskpro/app-sdk", () => ({
  ...jest.requireActual("@deskpro/app-sdk"),
  useDeskproLatestAppContext: () => ({
    context: {
      settings: {
        domain: "deskpro-jira"
      }
    }
  })
}));

jest.mock("../../hooks/hooks", () => ({
  parseJiraDescription: jest.fn((content) => content || "parsed-content"),
}));

describe("MapFieldValues", () => {

  describe("array fields", () => {


    test("should handle array schema misrepresentation", () => {

      const mockIssue = {
        key: "Deskpro-10",
        customfield_54321: { john: "doe" },
      };

      const mockUsableFields = [
        {
          required: false,
          schema: {
            type: "array",
            items: "option",
            custom: "com.atlassian.jira.plugin.system.customfieldtypes:multicheckboxes",
            customId: 10136,
          },
          name: "This is a Jira issue (Checkbox)",
          key: "customfield_54321",
          operations: ["add", "set", "remove"],
        },
      ];

      renderFieldValues(mockIssue, mockUsableFields)

      const dashValue = screen.getByTestId("jira-app-array-mapping-empty")

      expect(dashValue).toBeInTheDocument()
      expect(dashValue).toHaveTextContent("-")
    })

    test("should properly render array fields", () => {
      const mockIssue = {
        key: "Deskpro-10",
        customfield_543210: ["four", "four", "two"],
        customfield_54321: [
          {
            self: "https://not.impartant.com/10053",
            value: "veni",
            id: "10053",
          },
          {
            self: "https://not.impartant.com/10054",
            value: "vidi",
            id: "10054",
          },
          {
            self: "https://not.impartant.com/10055",
            value: "vici",
            id: "10055",
          },
        ],
      };

      const mockUsableFields = [
        {
          required: false,
          schema: {
            type: "array",
            items: "option",
            custom: "com.atlassian.jira.plugin.system.customfieldtypes:multicheckboxes",
            customId: 10136,
          },
          name: "This is a Jira issue (Checkbox)",
          key: "customfield_54321",
          operations: ["add", "set", "remove"],
        },
        {
          required: false,
          schema: {
            type: "array",
            items: "string",
            custom: "com.atlassian.jira.plugin.system.customfieldtypes:labels",
            customId: 10137,
          },
          name: "This is a Jira issue (Label)",
          key: "customfield_543210",
          operations: ["add", "set", "remove"],
        },
      ];

      renderFieldValues(mockIssue, mockUsableFields)

      expect(screen.getByText("This is a Jira issue (Checkbox)")).toBeInTheDocument();
      expect(screen.getByText("veni, vidi, vici")).toBeInTheDocument();

      expect(screen.getByText("This is a Jira issue (Label)")).toBeInTheDocument();
      expect(screen.getByText("four, four, two")).toBeInTheDocument();
    })

    test("should remove deformed options when rendering array fields", () => {
      const mockIssue = {
        key: "Deskpro-10",
        customfield_54321: [
          {
            self: "https://not.impartant.com/10053",
            value: "veni",
            id: "10053",
          },
          {
            self: "https://not.impartant.com/10054",
            id: "10054",
          },
          {
            self: "https://not.impartant.com/10055",
            value: "vici",
            id: "10055",
          },
        ],
      };

      const mockUsableFields = [
        {
          required: false,
          schema: {
            type: "array",
            items: "option",
            custom: "com.atlassian.jira.plugin.system.customfieldtypes:multicheckboxes",
            customId: 10136,
          },
          name: "This is a Jira issue (Checkbox)",
          key: "customfield_54321",
          operations: ["add", "set", "remove"],
        },
      ];

      renderFieldValues(mockIssue, mockUsableFields)

      expect(screen.getByText("This is a Jira issue (Checkbox)")).toBeInTheDocument();
      expect(screen.getByText("veni, vici")).toBeInTheDocument();
    })

  })
})