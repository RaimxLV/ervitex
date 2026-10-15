import { createFileRoute } from "@tanstack/react-router";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminGalleries from "@/pages/admin/AdminGalleries";

export const Route = createFileRoute("/admin/galleries")({
  component: () => (
    <ProtectedRoute>
      <AdminGalleries />
    </ProtectedRoute>
  ),
});
