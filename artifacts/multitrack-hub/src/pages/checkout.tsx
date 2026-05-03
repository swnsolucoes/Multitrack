import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetCart, useCreateOrder, getGetCartQueryKey, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Loader2, ArrowRight, ShoppingCart, CreditCard, QrCode } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useTranslation } from "react-i18next";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credit_card">("pix");

  const { data: cart, isLoading: isCartLoading } = useGetCart();
  const createOrder = useCreateOrder();

  const handleConfirmOrder = () => {
    if (!cart || cart.items.length === 0) return;
    createOrder.mutate({ data: { paymentMethod, couponCode: cart.couponCode } }, {
      onSuccess: (order) => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
        toast({ title: t("checkout.success") });
        setLocation(`/orders/${order.id}`);
      },
      onError: () => { toast({ variant: "destructive", title: t("common.error") }); },
    });
  };

  if (!user) return (
    <div className="min-h-screen flex flex-col bg-background"><Navbar />
      <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">{t("cart.login_required")}</h2>
        <div className="flex gap-4">
          <Link href="/login"><Button>{t("auth.login_btn")}</Button></Link>
          <Link href="/register"><Button variant="outline">{t("auth.register_btn")}</Button></Link>
        </div>
      </div><Footer />
    </div>
  );

  if (isCartLoading) return (
    <div className="min-h-screen flex flex-col bg-background"><Navbar />
      <div className="flex-grow flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      <Footer />
    </div>
  );

  if (!cart || cart.items.length === 0) return (
    <div className="min-h-screen flex flex-col bg-background"><Navbar />
      <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
        <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-2xl font-bold mb-4">{t("cart.empty_title")}</h2>
        <Link href="/catalog"><Button>{t("cart.explore")}</Button></Link>
      </div><Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-8">{t("checkout.title")}</h1>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-4">{t("checkout.payment_method")}</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${paymentMethod === "pix" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"}`}
                  onClick={() => setPaymentMethod("pix")}
                >
                  <QrCode className={`h-8 w-8 mb-2 ${paymentMethod === "pix" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="font-bold">{t("checkout.pix")}</span>
                  <span className="text-xs text-muted-foreground mt-1">{t("checkout.pix_desc")}</span>
                </button>
                <button
                  className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${paymentMethod === "credit_card" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"}`}
                  onClick={() => setPaymentMethod("credit_card")}
                >
                  <CreditCard className={`h-8 w-8 mb-2 ${paymentMethod === "credit_card" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="font-bold">{t("checkout.credit_card")}</span>
                  <span className="text-xs text-muted-foreground mt-1">{t("checkout.card_desc")}</span>
                </button>
              </div>
            </section>

            {paymentMethod === "credit_card" && (
              <section className="bg-card border border-border p-6 rounded-xl">
                <h3 className="font-bold mb-4">{t("checkout.credit_card")}</h3>
                <div className="space-y-4 text-muted-foreground text-sm">
                  <div className="h-10 bg-secondary rounded flex items-center px-3 border border-border">0000 0000 0000 0000</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-10 bg-secondary rounded flex items-center px-3 border border-border">MM/AA</div>
                    <div className="h-10 bg-secondary rounded flex items-center px-3 border border-border">CVC</div>
                  </div>
                </div>
              </section>
            )}
          </div>

          <div>
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24 shadow-lg">
              <h3 className="font-bold text-lg mb-6">{t("checkout.order_summary")}</h3>
              <div className="space-y-4 mb-6">
                {cart.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate pr-4">{item.product.name}</span>
                    <span className="font-medium shrink-0">{formatCurrency(item.price)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>{t("checkout.subtotal")}</span>
                  <span>{formatCurrency(cart.subtotal)}</span>
                </div>
                {cart.couponCode && (
                  <div className="flex justify-between text-primary">
                    <span>{t("cart.discount")} ({cart.couponCode})</span>
                    <span>-{formatCurrency(cart.discount || cart.couponDiscount || 0)}</span>
                  </div>
                )}
                <div className="border-t border-border pt-4 flex justify-between items-center">
                  <span className="font-bold text-lg">{t("checkout.total")}</span>
                  <span className="font-bold text-3xl text-primary">{formatCurrency(cart.total)}</span>
                </div>
              </div>
              <Button size="lg" className="w-full h-14 mt-8 font-bold text-lg" onClick={handleConfirmOrder} disabled={createOrder.isPending}>
                {createOrder.isPending ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                  <>{t("checkout.confirm")} <ArrowRight className="ml-2 h-5 w-5" /></>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
