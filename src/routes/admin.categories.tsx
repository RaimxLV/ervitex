import { createFileRoute } from "@tanstack/react-router";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminCategories from "@/pages/admin/AdminCategories";

export const Route = createFileRoute("/admin/categories")({
  component: () => (
    <ProtectedRoute>
      <AdminCategories />
    </ProtectedRoute>
  ),
});
