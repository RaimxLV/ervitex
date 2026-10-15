import { createFileRoute } from "@tanstack/react-router";
import { privateHead } from "@/lib/seo";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminTeamPhotos from "@/pages/admin/AdminTeamPhotos";

export const Route = createFileRoute("/admin/team-photos")({
  head: () => privateHead(),
  component: () => (
    <ProtectedRoute>
      <AdminTeamPhotos />
    </ProtectedRoute>
  ),
});
