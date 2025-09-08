import { getIsAuthenticated } from "./useAuthentication";
import { getAuthenticatedUser } from "@/api/auth";
import { JiraError } from "@/api/jiraRequest";
import { IS_USING_OAUTH2 } from "@/constants";
import { IDeskproClient } from "@deskpro/app-sdk";

jest.mock("@/api/auth", () => ({
  getAuthenticatedUser: jest.fn(),
}));

const mockClient = {
  setUserState: jest.fn(),
} as unknown as IDeskproClient;

describe("getIsAuthenticated", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return true if authentication is successful", async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValueOnce(true);

    const result = await getIsAuthenticated(mockClient, true);

    expect(mockClient.setUserState).toHaveBeenCalledWith(IS_USING_OAUTH2, true);
    expect(result).toBe(true);
  });

  it("should return false if a Jira error occurs with the status 401", async () => {
    (getAuthenticatedUser as jest.Mock).mockRejectedValueOnce(
      new JiraError("Unauthorized", { statusCode: 401 })
    );

    const result = await getIsAuthenticated(mockClient, false);

    expect(result).toBe(false);
  });

  it("should return false if a Jira error occurs with the status 403", async () => {
    (getAuthenticatedUser as jest.Mock).mockRejectedValueOnce(
      new JiraError("Unauthorized", { statusCode: 403 })
    );

    const result = await getIsAuthenticated(mockClient, false);

    expect(result).toBe(false);
  });

  it("should return false if a Jira error occurs with the status 404", async () => {
    (getAuthenticatedUser as jest.Mock).mockRejectedValueOnce(
      new JiraError("Unauthorized", { statusCode: 404 })
    );

    const result = await getIsAuthenticated(mockClient, false);

    expect(result).toBe(false);
  });

  it("should throw an error if a Jira error occurs with the status 400", async () => {
    (getAuthenticatedUser as jest.Mock).mockRejectedValueOnce(
      new JiraError("Terrible request", { statusCode: 400 })
    );

     await expect(getIsAuthenticated(mockClient, false)).rejects.toThrow("Terrible request")
  });

  it("should throw if a non-JiraError is thrown", async () => {
    const error = new Error("Test error");
    (getAuthenticatedUser as jest.Mock).mockRejectedValueOnce(error);

    await expect(getIsAuthenticated(mockClient, false)).rejects.toThrow("Test error");
  });
});
