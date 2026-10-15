import { createFileRoute } from "@tanstack/react-router";
import { privateHead } from "@/lib/seo";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminGalleries from "@/pages/admin/AdminGalleries";

export const Route = createFileRoute("/admin/galleries")({
  head: () => privateHead(),
  component: () => (
    <ProtectedRoute>
      <AdminGalleries />
    </ProtectedRoute>
  ),
});
