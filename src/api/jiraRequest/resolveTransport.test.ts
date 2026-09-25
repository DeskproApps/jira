import resolveTransport from "./resolveTransport";

const CLOUD_ID = "11111111-2222-3333-4444-555555555555";
const ADMIN_SETTINGS = { domain: "acme", username: "someone@acme.test", api_key: "TOKEN" };

describe("resolveTransport", () => {
  it("sends OAuth traffic to the gateway with the stored access token", () => {
    const { baseURL, authorization } = resolveTransport({
      isUsingOAuth2: true,
      credentialMode: "site",
      cloudID: CLOUD_ID,
    });

    expect(baseURL).toBe(`https://api.atlassian.com/ex/jira/${CLOUD_ID}/rest/api/3`);
    expect(authorization).toBe("Bearer [user[oauth2/access_token]]");
  });

  it("leaves the agent's credentials as placeholders for the proxy to fill", () => {
    const { baseURL, authorization } = resolveTransport({
      isUsingOAuth2: false,
      credentialMode: "site",
    });

    expect(baseURL).toBe("https://__domain__.atlassian.net/rest/api/3");
    expect(authorization).toBe("Basic __username+':'+api_key.base64__");
  });

  it("keeps the same placeholders when the agent's credential needs the gateway", () => {
    const { baseURL, authorization } = resolveTransport({
      isUsingOAuth2: false,
      credentialMode: "gateway",
      cloudID: CLOUD_ID,
    });

    expect(baseURL).toBe(`https://api.atlassian.com/ex/jira/${CLOUD_ID}/rest/api/3`);
    expect(authorization).toBe("Basic __username+':'+api_key.base64__");
  });

  it("uses the real values on the admin settings page, where they are available", () => {
    const { baseURL, authorization } = resolveTransport({
      isUsingOAuth2: false,
      credentialMode: "site",
      settings: ADMIN_SETTINGS,
    });

    expect(baseURL).toBe("https://acme.atlassian.net/rest/api/3");
    expect(authorization).toBe(`Basic ${btoa("someone@acme.test:TOKEN")}`);
  });

  it("moves the admin settings page to the gateway too when asked", () => {
    const { baseURL, authorization } = resolveTransport({
      isUsingOAuth2: false,
      credentialMode: "gateway",
      cloudID: CLOUD_ID,
      settings: ADMIN_SETTINGS,
    });

    expect(baseURL).toBe(`https://api.atlassian.com/ex/jira/${CLOUD_ID}/rest/api/3`);
    expect(authorization).toBe(`Basic ${btoa("someone@acme.test:TOKEN")}`);
  });

  it("does not treat a domain on its own as admin credentials", () => {
    const { baseURL, authorization } = resolveTransport({
      isUsingOAuth2: false,
      credentialMode: "site",
      settings: { domain: "acme" },
    });

    expect(baseURL).toBe("https://__domain__.atlassian.net/rest/api/3");
    expect(authorization).toBe("Basic __username+':'+api_key.base64__");
  });
});
