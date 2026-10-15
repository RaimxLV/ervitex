import { createFileRoute } from "@tanstack/react-router";
import { privateHead } from "@/lib/seo";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminFilterOrder from "@/pages/admin/AdminFilterOrder";

export const Route = createFileRoute("/admin/filters")({
  head: () => privateHead(),
  component: () => (
    <ProtectedRoute>
      <AdminFilterOrder />
    </ProtectedRoute>
  ),
});
