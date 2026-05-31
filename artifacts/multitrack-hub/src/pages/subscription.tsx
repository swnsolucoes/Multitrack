import { useGetMySubscription, useCancelSubscription, useGetCreditBalance, getGetMySubscriptionQueryKey, getGetCreditBalanceQueryKey } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { Loader2, Zap, Calendar, History, ArrowRight, CreditCard } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

export default function Subscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "pt" ? ptBR : enUS;

  const { data: subscription, isLoading: loadingSub } = useGetMySubscription({ query: { enabled: !!user, queryKey: getGetMySubscriptionQueryKey() } });
  const { data: creditBalance, isLoading: loadingCredits } = useGetCreditBalance({ query: { enabled: !!user, queryKey: getGetCreditBalanceQueryKey() } });
  const cancelSubscription = useCancelSubscription();

  const handleCancel = () => {
    if (confirm(t("subscription.cancel_confirm"))) {
      cancelSubscription.mutate(undefined, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetMySubscriptionQueryKey() }); toast({ title: t("subscription.cancel_btn") }); },
        onError: () => { toast({ variant: "destructive", title: t("common.error") }); },
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-500/20 text-green-500 border-green-500/50">{t("subscription.status_active")}</Badge>;
      case "cancelled": return <Badge className="bg-destructive/20 text-destructive border-destructive/50">{t("subscription.status_cancelled")}</Badge>;
      case "past_due": return <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/50">{t("subscription.status_past_due")}</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getCreditTypeText = (type: string) => {
    const map: Record<string, string> = {
      earned: t("subscription.credit_earned"),
      used: t("subscription.credit_used"),
      expired: t("subscription.credit_expired"),
      refunded: t("subscription.credit_refunded"),
      adjusted: t("subscription.credit_adjusted"),
    };
    return map[type] || type;
  };

  const getCreditTypeIcon = (type: string) => {
    switch (type) {
      case "earned": return <div className="h-8 w-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center"><Zap className="h-4 w-4" /></div>;
      case "used": return <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center"><ArrowRight className="h-4 w-4" /></div>;
      case "expired": return <div className="h-8 w-8 rounded-full bg-destructive/20 text-destructive flex items-center justify-center"><Calendar className="h-4 w-4" /></div>;
      case "refunded": return <div className="h-8 w-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center"><History className="h-4 w-4" /></div>;
      default: return <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center"><CreditCard className="h-4 w-4" /></div>;
    }
  };

  if (!user) return (
    <div className="min-h-screen flex flex-col bg-background"><Navbar />
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center"><h2 className="text-2xl font-bold mb-4">{t("auth.login_btn")}</h2>
          <Link href="/login"><Button>{t("auth.login_btn")}</Button></Link></div>
      </div><Footer />
    </div>
  );

  if (loadingSub || loadingCredits) return (
    <div className="min-h-screen flex flex-col bg-background"><Navbar />
      <div className="flex-grow flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-3xl font-bold tracking-tight mb-8">{t("subscription.title")}</h1>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5"><Zap className="h-24 w-24" /></div>
              <h3 className="font-bold text-lg mb-2">{t("subscription.credits_title")}</h3>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-5xl font-extrabold text-primary">{creditBalance?.balance || 0}</span>
                <span className="text-muted-foreground mb-1">/ {creditBalance?.maxBalance || 0} máx</span>
              </div>
              <Link href="/catalog"><Button className="w-full">{t("subscription.credits_title")}</Button></Link>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4">{t("subscription.title")}</h3>
              {subscription ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-xl">{subscription.planName}</span>
                    {getStatusBadge(subscription.status)}
                  </div>
                  <div className="space-y-2 text-sm mb-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("subscription.current_period")}:</span>
                      <span className="font-medium">{format(new Date(subscription.currentPeriodEnd), "dd/MM/yyyy")}</span>
                    </div>
                    {subscription.cancelAtPeriodEnd && (
                      <div className="bg-amber-500/10 text-amber-500 p-3 rounded-lg mt-4 text-xs">
                        {t("subscription.cancel_at_end")}
                      </div>
                    )}
                  </div>
                  {!subscription.cancelAtPeriodEnd && subscription.status === "active" && (
                    <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                      onClick={handleCancel} disabled={cancelSubscription.isPending}>
                      {cancelSubscription.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t("subscription.cancel_btn")}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">{t("subscription.no_plan")}</p>
                  <Link href="/plans"><Button className="w-full">{t("subscription.explore_plans")}</Button></Link>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-6 border-b border-border bg-secondary/20">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" /> {t("subscription.history_title")}
                </h3>
              </div>
              {!creditBalance?.ledger || creditBalance.ledger.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">—</div>
              ) : (
                <div className="divide-y divide-border">
                  {creditBalance.ledger.map(entry => (
                    <div key={entry.id} className="p-4 sm:p-6 flex items-center gap-4">
                      {getCreditTypeIcon(entry.type)}
                      <div className="flex-grow">
                        <p className="font-medium">{getCreditTypeText(entry.type)}</p>
                        <p className="text-sm text-muted-foreground">{entry.description}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${entry.amount > 0 ? "text-green-500" : "text-foreground"}`}>
                          {entry.amount > 0 ? "+" : ""}{entry.amount}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(entry.createdAt), "dd MMM, HH:mm", { locale })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
