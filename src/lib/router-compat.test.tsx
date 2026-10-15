import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useSearchParams } from "./router-compat";

vi.mock("@tanstack/react-router", () => ({
  useLocation: () => ({ searchStr: '?page=%222%22&q=%22Krekls%22', search: { page: "2", q: "Krekls" } }),
  useNavigate: () => vi.fn(),
  useRouter: () => ({ state: { location: { pathname: "/catalog", search: { page: "2" } } } }),
  Link: () => null, Navigate: () => null, Outlet: () => null,
}));

describe("catalog search parameters", () => {
  it("reads parsed values rather than JSON-encoded URL strings", () => {
    const { result } = renderHook(() => useSearchParams());
    expect(result.current[0].get("page")).toBe("2");
    expect(result.current[0].get("q")).toBe("Krekls");
  });
});