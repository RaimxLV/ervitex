import { createFileRoute } from "@tanstack/react-router";
import { privateHead } from "@/lib/seo";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminMegaMenu from "@/pages/admin/AdminMegaMenu";

export const Route = createFileRoute("/admin/mega-menu")({
  head: () => privateHead(),
  component: () => (
    <ProtectedRoute>
      <AdminMegaMenu />
    </ProtectedRoute>
  ),
});
