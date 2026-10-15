import { createFileRoute } from "@tanstack/react-router";
import { privateHead } from "@/lib/seo";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminUsers from "@/pages/admin/AdminUsers";

export const Route = createFileRoute("/admin/users")({
  head: () => privateHead(),
  component: () => (
    <ProtectedRoute>
      <AdminUsers />
    </ProtectedRoute>
  ),
});
