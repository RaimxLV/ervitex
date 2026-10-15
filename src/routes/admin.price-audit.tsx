import { createFileRoute } from "@tanstack/react-router";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminPriceAudit from "@/pages/admin/AdminPriceAudit";

export const Route = createFileRoute("/admin/price-audit")({
  component: () => (
    <ProtectedRoute>
      <AdminPriceAudit />
    </ProtectedRoute>
  ),
});
