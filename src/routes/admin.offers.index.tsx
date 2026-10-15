import { createFileRoute } from "@tanstack/react-router";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminOffers from "@/pages/admin/AdminOffers";

export const Route = createFileRoute("/admin/offers/")({
  component: () => (
    <ProtectedRoute>
      <AdminOffers />
    </ProtectedRoute>
  ),
});
