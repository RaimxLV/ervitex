import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./useAuth";
import { useEffect } from "react";
const mocks = vi.hoisted(() => ({ callback: undefined as undefined | ((event: string, session: unknown) => void), role: vi.fn(), mounted: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  auth: {
    getSession: async () => ({ data: { session: { user: { id: "pm-1", email: "pm@example.test" } } } }),
    onAuthStateChange: (callback: typeof mocks.callback) => { mocks.callback = callback; return { data: { subscription: { unsubscribe: vi.fn() } } }; },
  },
  from: () => { const q = { select: () => q, eq: () => q, maybeSingle: mocks.role }; return q; },
} }));
function Editor() { useEffect(() => { mocks.mounted(); }, []); return <div>editor</div>; }
function Gate() { const auth = useAuth(); return auth.loading ? <div>loading</div> : auth.isAdmin ? <Editor /> : <div>denied</div>; }
describe("idle session renewal", () => {
  it("keeps editor mounted through token refresh but removes it on sign-out", async () => {
    mocks.role.mockResolvedValue({ data: { role: "admin" } });
    render(<AuthProvider><Gate /></AuthProvider>);
    await waitFor(() => expect(screen.getByText("editor")).toBeInTheDocument());
    const checks = mocks.role.mock.calls.length; const mounts = mocks.mounted.mock.calls.length;
    act(() => mocks.callback?.("TOKEN_REFRESHED", { user: { id: "pm-1", email: "pm@example.test" } }));
    expect(screen.getByText("editor")).toBeInTheDocument();
    expect(mocks.role).toHaveBeenCalledTimes(checks);
    expect(mocks.mounted).toHaveBeenCalledTimes(mounts);
    act(() => mocks.callback?.("SIGNED_OUT", null));
    expect(screen.getByText("denied")).toBeInTheDocument();
  });
});