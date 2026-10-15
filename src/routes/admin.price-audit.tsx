import { createFileRoute } from "@tanstack/react-router";
import { privateHead } from "@/lib/seo";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminPriceAudit from "@/pages/admin/AdminPriceAudit";

export const Route = createFileRoute("/admin/price-audit")({
  head: () => privateHead(),
  component: () => (
    <ProtectedRoute>
      <AdminPriceAudit />
    </ProtectedRoute>
  ),
});
