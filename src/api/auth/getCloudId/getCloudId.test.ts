import getCloudId from "./getCloudId";
import { proxyFetch } from "@deskpro/app-sdk";
import { CLOUD_ID_PATH } from "@/constants";
import { IDeskproClient } from "@deskpro/app-sdk";

jest.mock("@deskpro/app-sdk", () => ({
  proxyFetch: jest.fn(),
  adminGenericProxyFetch: jest.fn(),
}));

const CLOUD_ID = "11111111-2222-3333-4444-555555555555";

let cached: string | undefined;

const mockClient = {
  getUserState: jest.fn(() => Promise.resolve([{ data: cached }])),
  setUserState: jest.fn((_path: string, value: string) => {
    cached = value;
    return Promise.resolve();
  }),
} as unknown as IDeskproClient;

function response(ok: boolean, body: unknown = {}) {
  return { ok, json: () => Promise.resolve(body) };
}

describe("getCloudId", () => {
  const dpFetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    cached = undefined;
    (proxyFetch as jest.Mock).mockResolvedValue(dpFetch);
  });

  it("prefers the admin's setting over anything else", async () => {
    const result = await getCloudId(mockClient, { cloud_id: CLOUD_ID });

    expect(result).toBe(CLOUD_ID);
    expect(dpFetch).not.toHaveBeenCalled();
  });

  it("reuses a cached value rather than asking Atlassian again", async () => {
    cached = CLOUD_ID;

    const result = await getCloudId(mockClient, {});

    expect(result).toBe(CLOUD_ID);
    expect(dpFetch).not.toHaveBeenCalled();
  });

  it("asks Atlassian without a credential, and caches the answer", async () => {
    dpFetch.mockResolvedValueOnce(response(true, { cloudId: CLOUD_ID }));

    const result = await getCloudId(mockClient, {});

    expect(result).toBe(CLOUD_ID);
    expect(dpFetch).toHaveBeenCalledWith("https://__domain__.atlassian.net/_edge/tenant_info");
    expect(mockClient.setUserState).toHaveBeenCalledWith(CLOUD_ID_PATH, CLOUD_ID);
  });

  it("explains itself when the site cannot be asked", async () => {
    dpFetch.mockResolvedValueOnce(response(false));

    await expect(getCloudId(mockClient, {})).rejects.toThrow("Cloud ID setting");
  });

  it.each([
    ["a path traversal", "../../../else"],
    ["a query string", `${CLOUD_ID}?x=1`],
    ["a fragment", `${CLOUD_ID}#x`],
    ["free text", "my jira site"],
  ])("refuses %s from the admin's setting rather than putting it in a url", async (_label, value) => {
    await expect(getCloudId(mockClient, { cloud_id: value })).rejects.toThrow("not in the expected format");
  });

  it("refuses a malformed value returned by the remote endpoint", async () => {
    dpFetch.mockResolvedValueOnce(response(true, { cloudId: "../../evil" }));

    await expect(getCloudId(mockClient, {})).rejects.toThrow("not in the expected format");
    expect(mockClient.setUserState).not.toHaveBeenCalled();
  });

  it("tolerates whitespace around a pasted setting", async () => {
    const result = await getCloudId(mockClient, { cloud_id: `  ${CLOUD_ID}  ` });

    expect(result).toBe(CLOUD_ID);
  });
});
