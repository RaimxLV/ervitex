import { createFileRoute } from "@tanstack/react-router";
import { privateHead } from "@/lib/seo";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminCategories from "@/pages/admin/AdminCategories";

export const Route = createFileRoute("/admin/categories")({
  head: () => privateHead(),
  component: () => (
    <ProtectedRoute>
      <AdminCategories />
    </ProtectedRoute>
  ),
});
