import { createFileRoute } from "@tanstack/react-router";
import { privateHead } from "@/lib/seo";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProducts from "@/pages/admin/AdminProducts";

export const Route = createFileRoute("/admin/products/")({
  head: () => privateHead(),
  component: () => (
    <ProtectedRoute>
      <AdminProducts />
    </ProtectedRoute>
  ),
});
