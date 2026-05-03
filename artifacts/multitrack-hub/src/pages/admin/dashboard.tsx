import { useGetAdminDashboard } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Loader2, DollarSign, Users, ShoppingCart, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useTranslation } from "react-i18next";

export default function AdminDashboard() {
  const { data: metrics, isLoading } = useGetAdminDashboard();
  const { t } = useTranslation();

  if (isLoading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </AdminLayout>
  );

  if (!metrics) return <AdminLayout><div>{t("common.error")}</div></AdminLayout>;

  const revenueData = [
    { name: t("rateios.title").split(" ")[0] + " Purchase", value: metrics.revenueByChannel.singlePurchase },
    { name: t("subscription.title"), value: metrics.revenueByChannel.subscription },
    { name: "Bundle", value: metrics.revenueByChannel.bundle },
    { name: t("rateios.title"), value: metrics.revenueByChannel.rateio },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("admin.dashboard")}</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.revenue")}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">{t("admin.mrr")}: {formatCurrency(metrics.mrr)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.orders")}</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalOrders}</div>
              <p className="text-xs text-muted-foreground">{t("admin.avg_order")}: {formatCurrency(metrics.averageOrderValue)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.users")}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalUsers}</div>
              <p className="text-xs text-muted-foreground">{metrics.premiumUsers} {t("admin.premium_users")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.downloads")}</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalDownloads}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>{t("admin.revenue_by_channel")}</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v}`} />
                    <Tooltip cursor={{ fill: "transparent" }}
                      contentStyle={{ backgroundColor: "#1f1f23", borderColor: "#27272a", borderRadius: "8px" }}
                      formatter={(value: number) => [formatCurrency(value), t("admin.revenue")]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {revenueData.map((_, index) => <Cell key={`cell-${index}`} fill="hsl(180 100% 50%)" />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>{t("admin.top_products")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.topProducts.map((product, i) => (
                  <div key={product.id} className="flex items-center">
                    <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center font-bold text-xs text-muted-foreground mr-3">
                      {i + 1}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.artist}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">{formatCurrency(product.revenue)}</p>
                      <p className="text-xs text-muted-foreground">{product.sales} sales</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
