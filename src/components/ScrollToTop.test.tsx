import { render } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import ScrollToTop from "./ScrollToTop";

const state = vi.hoisted(() => ({
  location: { pathname: "/catalog", hash: "" },
  resolvedLocation: { pathname: "/catalog", hash: "" },
}));
vi.mock("@tanstack/react-router", () => ({
  useRouterState: ({ select }: { select: (value: typeof state) => unknown }) => select(state),
}));
beforeEach(() => {
  state.location = { pathname: "/catalog", hash: "" };
  state.resolvedLocation = { pathname: "/catalog", hash: "" };
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
});

it("keeps catalog scroll while the product loads, then scrolls after it mounts", () => {
  const view = render(<ScrollToTop />);
  vi.mocked(window.scrollTo).mockClear();
  state.location = { pathname: "/catalog/item/ss/STTU169", hash: "" };
  view.rerender(<ScrollToTop />);
  expect(window.scrollTo).not.toHaveBeenCalled();
  state.resolvedLocation = state.location;
  view.rerender(<ScrollToTop />);
  expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
});