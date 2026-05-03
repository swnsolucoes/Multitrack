import { useState } from "react";
import { Link } from "wouter";
import { useAdminListUsers } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export default function AdminUsers() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useAdminListUsers({ q });
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "pt" ? ptBR : enUS;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin": return <Badge className="bg-destructive text-destructive-foreground">Admin</Badge>;
      case "premium": return <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/50">Premium</Badge>;
      default: return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("admin.users")}</h1>
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
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>{t("admin.orders")}</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">{t("common.edit")}</TableHead>
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
                data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{user.ordersCount}</TableCell>
                    <TableCell>{formatCurrency(user.totalSpent)}</TableCell>
                    <TableCell>{format(new Date(user.createdAt), "dd MMM yyyy", { locale })}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/users/${user.id}`}>
                        <Button variant="ghost" size="sm">
                          {t("orders.view_details")} <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
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
