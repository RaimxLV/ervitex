import { createFileRoute } from "@tanstack/react-router";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminUsers from "@/pages/admin/AdminUsers";

export const Route = createFileRoute("/admin/users")({
  component: () => (
    <ProtectedRoute>
      <AdminUsers />
    </ProtectedRoute>
  ),
});
