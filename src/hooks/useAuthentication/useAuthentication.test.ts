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
      data: undefined,
    });

    const { result } = renderHook(() => useAuthentication({ isUsingOAuth: true }));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("should return authenticated when query returns true", () => {
    (useQueryWithClient as jest.Mock).mockReturnValue({
      isLoading: false,
      data: true,
    });

    const { result } = renderHook(() => useAuthentication({ isUsingOAuth: false }));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("should return unauthenticated when query returns false", () => {
    (useQueryWithClient as jest.Mock).mockReturnValue({
      isLoading: false,
      data: false,
    });

    const { result } = renderHook(() => useAuthentication({ isUsingOAuth: false }));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
  });
});
