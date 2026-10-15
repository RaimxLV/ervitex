import { createFileRoute } from "@tanstack/react-router";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminOfferEdit from "@/pages/admin/AdminOfferEdit";

export const Route = createFileRoute("/offers/$id")({
  component: () => (
    <ProtectedRoute>
      <AdminOfferEdit />
    </ProtectedRoute>
  ),
});
