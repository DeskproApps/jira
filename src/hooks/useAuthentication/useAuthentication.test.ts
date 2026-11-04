import { renderHook } from "@testing-library/react";
import useAuthentication from "./useAuthentication";
import { useQueryWithClient } from "@deskpro/app-sdk";

jest.mock("@deskpro/app-sdk", () => ({
  useQueryWithClient: jest.fn(),
}));

describe("useAuthentication", () => {
  it("should return loading when query is loading", () => {
    (useQueryWithClient as jest.Mock).mockReturnValue({
      isLoading: true,
      isFetching: true,
      data: undefined,
    });

    const { result } = renderHook(() => useAuthentication({ isUsingOAuth: true }));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("should return loading when query is fetching but not loading", () => {
    (useQueryWithClient as jest.Mock).mockReturnValue({
      isLoading: false,
      isFetching: true,
      data: undefined,
    });

    const { result } = renderHook(() => useAuthentication({ isUsingOAuth: true }));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("should return authenticated when the query reports success", () => {
    (useQueryWithClient as jest.Mock).mockReturnValue({
      isLoading: false,
      isFetching: false,
      data: { isAuthenticated: true },
    });

    const { result } = renderHook(() => useAuthentication({ isUsingOAuth: false }));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.failure).toBeUndefined();
  });

  it("should return unauthenticated when the query reports failure", () => {
    (useQueryWithClient as jest.Mock).mockReturnValue({
      isLoading: false,
      isFetching: false,
      data: { isAuthenticated: false, failure: "credentials" },
    });

    const { result } = renderHook(() => useAuthentication({ isUsingOAuth: false }));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it.each([
    ["credentials"],
    ["permissions"],
    ["site"],
  ])("should surface the %s failure so the page can explain it", (failure) => {
    (useQueryWithClient as jest.Mock).mockReturnValue({
      isLoading: false,
      isFetching: false,
      data: { isAuthenticated: false, failure },
    });

    const { result } = renderHook(() => useAuthentication({ isUsingOAuth: false }));

    expect(result.current.failure).toBe(failure);
  });
});
