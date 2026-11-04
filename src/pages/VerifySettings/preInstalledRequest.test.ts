import { preInstalledRequest } from "./VerifySettings";
import { adminGenericProxyFetch } from "@deskpro/app-sdk";
import { getCloudId } from "@/api/auth";
import { IDeskproClient } from "@deskpro/app-sdk";

jest.mock("@deskpro/app-sdk", () => ({
  adminGenericProxyFetch: jest.fn(),
}));

jest.mock("@/api/auth", () => ({
  getCloudId: jest.fn(),
}));

const CLOUD_ID = "11111111-2222-3333-4444-555555555555";
const SETTINGS = { domain: "acme", username: "someone@acme.test", api_key: "TOKEN" };

const mockClient = {} as IDeskproClient;

function response(status: number, body: unknown = {}) {
  return {
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  };
}

describe("preInstalledRequest", () => {
  const dpFetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (adminGenericProxyFetch as jest.Mock).mockResolvedValue(dpFetch);
    (getCloudId as jest.Mock).mockResolvedValue(CLOUD_ID);
  });

  it("verifies against the site host when the token is accepted there", async () => {
    dpFetch.mockResolvedValueOnce(response(200, { accountId: "1" }));

    const user = await preInstalledRequest(mockClient, SETTINGS);

    expect(user).toEqual({ accountId: "1" });
    expect(dpFetch).toHaveBeenCalledTimes(1);
    expect(dpFetch).toHaveBeenCalledWith(
      "https://acme.atlassian.net/rest/api/3/myself",
      expect.anything(),
    );
    expect(getCloudId).not.toHaveBeenCalled();
  });

  it("falls back to the gateway so a service account verifies rather than looking invalid", async () => {
    dpFetch
      .mockResolvedValueOnce(response(401))
      .mockResolvedValueOnce(response(200, { accountId: "2" }));

    const user = await preInstalledRequest(mockClient, SETTINGS);

    expect(user).toEqual({ accountId: "2" });
    expect(dpFetch).toHaveBeenNthCalledWith(
      2,
      `https://api.atlassian.com/ex/jira/${CLOUD_ID}/rest/api/3/myself`,
      expect.anything(),
    );
  });

  it("reports a failure when neither host accepts the token", async () => {
    dpFetch
      .mockResolvedValueOnce(response(401))
      .mockResolvedValueOnce(response(401));

    await expect(preInstalledRequest(mockClient, SETTINGS)).rejects.toThrow("Request failed: [401]");
  });

  it("does not try the gateway when the site host understood the request and refused it", async () => {
    dpFetch.mockResolvedValueOnce(response(403));

    await expect(preInstalledRequest(mockClient, SETTINGS)).rejects.toThrow("Request failed: [403]");
    expect(dpFetch).toHaveBeenCalledTimes(1);
    expect(getCloudId).not.toHaveBeenCalled();
  });
});
