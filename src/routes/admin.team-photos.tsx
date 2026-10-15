import { createFileRoute } from "@tanstack/react-router";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminTeamPhotos from "@/pages/admin/AdminTeamPhotos";

export const Route = createFileRoute("/admin/team-photos")({
  component: () => (
    <ProtectedRoute>
      <AdminTeamPhotos />
    </ProtectedRoute>
  ),
});
