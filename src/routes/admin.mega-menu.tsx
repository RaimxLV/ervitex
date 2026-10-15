import { createFileRoute } from "@tanstack/react-router";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminMegaMenu from "@/pages/admin/AdminMegaMenu";

export const Route = createFileRoute("/admin/mega-menu")({
  component: () => (
    <ProtectedRoute>
      <AdminMegaMenu />
    </ProtectedRoute>
  ),
});
