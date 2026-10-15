import { createFileRoute } from "@tanstack/react-router";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminQuotes from "@/pages/admin/AdminQuotes";

export const Route = createFileRoute("/admin/quotes")({
  component: () => (
    <ProtectedRoute>
      <AdminQuotes />
    </ProtectedRoute>
  ),
});
