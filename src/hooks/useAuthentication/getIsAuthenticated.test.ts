import { getIsAuthenticated } from "./useAuthentication";
import { getAuthenticatedUser, getCloudId } from "@/api/auth";
import { JiraError } from "@/api/jiraRequest";
import { CREDENTIAL_MODE_PATH, IS_USING_OAUTH2 } from "@/constants";
import { IDeskproClient } from "@deskpro/app-sdk";

jest.mock("@/api/auth", () => ({
  getAuthenticatedUser: jest.fn(),
  getCloudId: jest.fn(),
}));

const CLOUD_ID = "11111111-2222-3333-4444-555555555555";

let storedMode: string | null = null;

const mockClient = {
  setUserState: jest.fn((path: string, value: unknown) => {
    if (path === CREDENTIAL_MODE_PATH) {
      storedMode = value as string | null;
    }
    return Promise.resolve();
  }),
  getUserState: jest.fn((path: string) => {
    if (path === CREDENTIAL_MODE_PATH) {
      return Promise.resolve([{ data: storedMode }]);
    }
    return Promise.resolve([{ data: undefined }]);
  }),
} as unknown as IDeskproClient;

const unauthorised = () => new JiraError("Unauthorized", { statusCode: 401 });

describe("getIsAuthenticated", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    storedMode = null;
    (getCloudId as jest.Mock).mockResolvedValue(CLOUD_ID);
  });

  it("should report success if authentication is successful", async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValueOnce(true);

    const result = await getIsAuthenticated(mockClient, true);

    expect(mockClient.setUserState).toHaveBeenCalledWith(IS_USING_OAUTH2, true);
    expect(result).toEqual({ isAuthenticated: true });
  });

  it.each([
    [401, "credentials"],
    [403, "permissions"],
    [404, "site"],
  ])("should report status %i as the %s failure", async (statusCode, failure) => {
    (getAuthenticatedUser as jest.Mock).mockRejectedValue(
      new JiraError("Refused", { statusCode })
    );

    const result = await getIsAuthenticated(mockClient, true);

    expect(result).toEqual({ isAuthenticated: false, failure });
  });

  it("should throw an error if a Jira error occurs with the status 400", async () => {
    (getAuthenticatedUser as jest.Mock).mockRejectedValueOnce(
      new JiraError("Terrible request", { statusCode: 400 })
    );

    await expect(getIsAuthenticated(mockClient, true)).rejects.toThrow("Terrible request")
  });

  it("should throw if a non-JiraError is thrown", async () => {
    const error = new Error("Test error");
    (getAuthenticatedUser as jest.Mock).mockRejectedValueOnce(error);

    await expect(getIsAuthenticated(mockClient, true)).rejects.toThrow("Test error");
  });

  describe("api key host probe", () => {
    it("should use the site host when the token is accepted there, and remember it", async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValueOnce(true);

      const result = await getIsAuthenticated(mockClient, false);

      expect(result).toEqual({ isAuthenticated: true });
      expect(getAuthenticatedUser).toHaveBeenCalledTimes(1);
      expect(getAuthenticatedUser).toHaveBeenCalledWith(
        mockClient,
        expect.objectContaining({ credentialMode: "site" })
      );
      expect(storedMode).toBe("site");
      expect(getCloudId).not.toHaveBeenCalled();
    });

    it("should fall back to the gateway when the site host rejects the token, and remember it", async () => {
      (getAuthenticatedUser as jest.Mock)
        .mockRejectedValueOnce(unauthorised())
        .mockResolvedValueOnce(true);

      const result = await getIsAuthenticated(mockClient, false);

      expect(result).toEqual({ isAuthenticated: true });
      expect(getAuthenticatedUser).toHaveBeenNthCalledWith(
        2,
        mockClient,
        expect.objectContaining({ credentialMode: "gateway", cloudID: CLOUD_ID })
      );
      expect(storedMode).toBe("gateway");
    });

    it("should reuse a remembered host without probing the other one", async () => {
      storedMode = "gateway";
      (getAuthenticatedUser as jest.Mock).mockResolvedValueOnce(true);

      const result = await getIsAuthenticated(mockClient, false);

      expect(result).toEqual({ isAuthenticated: true });
      expect(getAuthenticatedUser).toHaveBeenCalledTimes(1);
      expect(getAuthenticatedUser).toHaveBeenCalledWith(
        mockClient,
        expect.objectContaining({ credentialMode: "gateway" })
      );
    });

    it("should move to the other host when a remembered one stops working, so a swapped token re-probes", async () => {
      storedMode = "gateway";
      (getAuthenticatedUser as jest.Mock)
        .mockRejectedValueOnce(unauthorised())
        .mockResolvedValueOnce(true);

      const result = await getIsAuthenticated(mockClient, false);

      expect(result).toEqual({ isAuthenticated: true });
      expect(getAuthenticatedUser).toHaveBeenNthCalledWith(
        1,
        mockClient,
        expect.objectContaining({ credentialMode: "gateway" })
      );
      expect(getAuthenticatedUser).toHaveBeenNthCalledWith(
        2,
        mockClient,
        expect.objectContaining({ credentialMode: "site" })
      );
      expect(storedMode).toBe("site");
    });

    it("should start from the remembered host rather than always trying the site first", async () => {
      storedMode = "gateway";
      (getAuthenticatedUser as jest.Mock).mockRejectedValue(unauthorised());

      await getIsAuthenticated(mockClient, false);

      expect(getAuthenticatedUser).toHaveBeenCalledTimes(2);
      expect(getAuthenticatedUser).toHaveBeenNthCalledWith(
        1,
        mockClient,
        expect.objectContaining({ credentialMode: "gateway" })
      );
    });

    it("should not try the gateway when the request was understood but refused", async () => {
      (getAuthenticatedUser as jest.Mock).mockRejectedValueOnce(
        new JiraError("Forbidden", { statusCode: 403 })
      );

      const result = await getIsAuthenticated(mockClient, false);

      expect(result).toEqual({ isAuthenticated: false, failure: "permissions" });
      expect(getAuthenticatedUser).toHaveBeenCalledTimes(1);
      expect(getCloudId).not.toHaveBeenCalled();
    });

    it("should report the site host's failure when neither host accepts the token", async () => {
      (getAuthenticatedUser as jest.Mock).mockRejectedValue(unauthorised());

      const result = await getIsAuthenticated(mockClient, false);

      expect(result).toEqual({ isAuthenticated: false, failure: "credentials" });
      expect(storedMode).toBeNull();
    });

    it("should surface a cloud id that cannot be determined", async () => {
      (getAuthenticatedUser as jest.Mock).mockRejectedValueOnce(unauthorised());
      (getCloudId as jest.Mock).mockRejectedValueOnce(
        new Error("Could not determine the Jira cloud ID for this site.")
      );

      await expect(getIsAuthenticated(mockClient, false)).rejects.toThrow(
        "Could not determine the Jira cloud ID for this site."
      );
    });
  });
});
