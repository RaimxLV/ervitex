import { createFileRoute } from "@tanstack/react-router";
import { privateHead } from "@/lib/seo";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProductForm from "@/pages/admin/AdminProductForm";

export const Route = createFileRoute("/admin/products/$id")({
  head: () => privateHead(),
  component: () => (
    <ProtectedRoute>
      <AdminProductForm />
    </ProtectedRoute>
  ),
});
