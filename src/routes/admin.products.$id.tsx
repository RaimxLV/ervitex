import { createFileRoute } from "@tanstack/react-router";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProductForm from "@/pages/admin/AdminProductForm";

export const Route = createFileRoute("/admin/products/$id")({
  component: () => (
    <ProtectedRoute>
      <AdminProductForm />
    </ProtectedRoute>
  ),
});
