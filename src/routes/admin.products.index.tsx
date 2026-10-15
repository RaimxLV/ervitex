import { createFileRoute } from "@tanstack/react-router";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProducts from "@/pages/admin/AdminProducts";

export const Route = createFileRoute("/admin/products/")({
  component: () => (
    <ProtectedRoute>
      <AdminProducts />
    </ProtectedRoute>
  ),
});
