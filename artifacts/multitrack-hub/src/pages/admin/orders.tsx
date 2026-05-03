import { useState } from "react";
import { useAdminListOrders } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Search, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";

export default function AdminOrders() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useAdminListOrders({ q });
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "pt" ? ptBR : enUS;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "text-green-500 border-green-500/50 bg-green-500/10";
      case "pending": return "text-amber-500 border-amber-500/50 bg-amber-500/10";
      case "cancelled": return "text-destructive border-destructive/50 bg-destructive/10";
      default: return "text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      paid: t("orders.status_paid"),
      pending: t("orders.status_pending"),
      cancelled: t("orders.status_cancelled"),
      refunded: t("orders.status_refunded"),
    };
    return map[status] || status;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("admin.orders")}</h1>
        </div>

        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder={t("common.search")} className="pl-8 bg-card"
              value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        <div className="border border-border rounded-md bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </TableCell></TableRow>
              ) : !data || data.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">—</TableCell></TableRow>
              ) : (
                data.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id.toString().padStart(5, "0")}</TableCell>
                    <TableCell>{format(new Date(order.createdAt), "dd MMM yyyy, HH:mm", { locale })}</TableCell>
                    <TableCell>—</TableCell>
                    <TableCell>{order.itemCount}</TableCell>
                    <TableCell className="font-bold text-primary">{formatCurrency(order.total)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
