import { createFileRoute } from "@tanstack/react-router";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminFilterOrder from "@/pages/admin/AdminFilterOrder";

export const Route = createFileRoute("/admin/filters")({
  component: () => (
    <ProtectedRoute>
      <AdminFilterOrder />
    </ProtectedRoute>
  ),
});
