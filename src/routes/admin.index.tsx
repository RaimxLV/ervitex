import { createFileRoute, Navigate } from "@tanstack/react-router";
import { privateHead } from "@/lib/seo";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ADMIN_HOME } from "@/lib/adminNavigation";

export const Route = createFileRoute("/admin/")({
  head: () => privateHead(),
  component: () => (
    <ProtectedRoute>
      <Navigate to={ADMIN_HOME} replace />
    </ProtectedRoute>
  ),
});
