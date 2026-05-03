import { useParams, Link } from "wouter";
import { useAdminGetUser, useAdminUpdateUser, getAdminGetUserQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";

export default function AdminUserDetail() {
  const { id } = useParams();
  const userId = parseInt(id || "0");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "pt" ? ptBR : enUS;

  const { data: user, isLoading } = useAdminGetUser(userId, { query: { enabled: !!userId } });
  const updateUser = useAdminUpdateUser();

  const [role, setRole] = useState<string>("buyer");
  const [isBlocked, setIsBlocked] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (user) { setRole(user.role); setIsBlocked(user.isBlocked); setNotes(user.notes || ""); }
  }, [user]);

  const handleSave = () => {
    updateUser.mutate({ userId, data: { role: role as any, isBlocked, notes } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminGetUserQueryKey(userId) });
        toast({ title: t("common.save") });
      },
    });
  };

  if (isLoading) return (
    <AdminLayout><div className="flex items-center justify-center h-full min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div></AdminLayout>
  );

  if (!user) return <AdminLayout><div>{t("common.not_found_title")}</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/admin/users">
            <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4">Access Settings</h3>
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label>Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="w-full sm:w-64 bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buyer">Buyer</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-secondary/30">
                  <div>
                    <Label className="font-bold">Block User</Label>
                    <p className="text-xs text-muted-foreground mt-1">Prevents login and platform access.</p>
                  </div>
                  <Switch checked={isBlocked} onCheckedChange={setIsBlocked} />
                </div>

                <div className="space-y-3">
                  <Label>Internal Notes</Label>
                  <Textarea placeholder="Notes visible to admins only..."
                    className="min-h-[100px] bg-background" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>

                <div className="pt-2">
                  <Button onClick={handleSave} disabled={updateUser.isPending}>
                    {updateUser.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {t("common.save")}
                  </Button>
                </div>
              </div>
            </div>

            {user.recentOrders && user.recentOrders.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bold text-lg mb-4">{t("orders.title")}</h3>
                <div className="space-y-4">
                  {user.recentOrders.map(order => (
                    <div key={order.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-secondary/30">
                      <div>
                        <div className="font-bold">#{order.id.toString().padStart(5, "0")}</div>
                        <div className="text-xs text-muted-foreground">{format(new Date(order.createdAt), "dd MMM yyyy", { locale })}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">{formatCurrency(order.total)}</div>
                        <Badge variant="outline" className="text-[10px] mt-1">{order.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4">Summary</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Joined</span>
                  <span className="font-medium">{format(new Date(user.createdAt), "dd/MM/yyyy")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Spent</span>
                  <span className="font-bold text-primary">{formatCurrency(user.totalSpent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("admin.orders")}</span>
                  <span className="font-medium">{user.ordersCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("admin.credits")}</span>
                  <span className="font-medium">{user.creditBalance || 0}</span>
                </div>
              </div>
            </div>

            {user.subscription && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center justify-between">
                  {t("subscription.title")}
                  <Badge className={user.subscription.status === "active" ? "bg-green-500/20 text-green-500" : ""}>
                    {user.subscription.status}
                  </Badge>
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="font-bold text-primary">{user.subscription.planName}</div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("subscription.current_period")}:</span>
                    <span>{format(new Date(user.subscription.currentPeriodEnd), "dd/MM/yyyy")}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
