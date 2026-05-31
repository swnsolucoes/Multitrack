import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetCart, useRemoveFromCart, useApplyCoupon, useRemoveCoupon, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Trash2, ShoppingCart, ArrowRight, Ticket, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [couponCode, setCouponCode] = useState("");

  const { data: cart, isLoading } = useGetCart();
  const removeFromCart = useRemoveFromCart();
  const applyCoupon = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();

  const handleRemove = (id: number) => {
    removeFromCart.mutate({ itemId: id }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }); toast({ title: t("cart.remove_item") }); },
    });
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    applyCoupon.mutate({ data: { code: couponCode } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }); toast({ title: t("cart.apply_coupon") }); setCouponCode(""); },
      onError: () => { toast({ variant: "destructive", title: t("common.error"), description: "Invalid or expired coupon" }); },
    });
  };

  const handleRemoveCoupon = () => {
    removeCoupon.mutate(undefined, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }); toast({ title: t("cart.remove_coupon") }); },
    });
  };

  if (isLoading) return (
    <div className="min-h-screen flex flex-col bg-background"><Navbar />
      <div className="flex-grow flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      <Footer />
    </div>
  );

  const hasItems = cart && cart.items && cart.items.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-8">{t("cart.title")}</h1>

        {!hasItems ? (
          <div className="flex flex-col items-center justify-center text-center py-24 bg-card/30 rounded-2xl border border-dashed border-border">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t("cart.empty_title")}</h2>
            <p className="text-muted-foreground max-w-md mb-8">{t("cart.empty_desc")}</p>
            <Link href="/catalog"><Button size="lg" className="h-12 px-8 font-bold">{t("cart.explore")}</Button></Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-card border border-border rounded-xl group">
                  <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-secondary">
                    {item.product.coverUrl ? (
                      <img src={item.product.coverUrl} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart className="h-8 w-8 text-muted-foreground opacity-20" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{item.product.name}</h3>
                      <p className="text-muted-foreground text-sm">{item.product.artist}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="font-bold text-primary">{formatCurrency(item.price)}</span>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemove(item.product.id)} disabled={removeFromCart.isPending}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bold text-lg mb-4">{t("checkout.order_summary")}</h3>
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t("cart.subtotal")} ({cart.items.length})</span>
                    <span>{formatCurrency(cart.subtotal)}</span>
                  </div>
                  {cart.couponCode && (
                    <div className="flex justify-between text-primary">
                      <span className="flex items-center gap-1">
                        <Ticket className="h-3 w-3" /> {cart.couponCode}
                        <button onClick={handleRemoveCoupon} className="ml-2 text-destructive hover:underline text-xs">{t("cart.remove_coupon")}</button>
                      </span>
                      <span>-{formatCurrency(cart.discount || cart.couponDiscount || 0)}</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-3 mt-3 flex justify-between items-center">
                    <span className="font-bold text-base">{t("cart.total")}</span>
                    <span className="font-bold text-2xl">{formatCurrency(cart.total)}</span>
                  </div>
                </div>

                {!cart.couponCode && (
                  <div className="flex gap-2 mb-6">
                    <Input placeholder={t("cart.coupon_placeholder")} className="h-10 bg-secondary/50" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                    <Button variant="secondary" className="h-10 px-4" onClick={handleApplyCoupon} disabled={applyCoupon.isPending || !couponCode.trim()}>
                      {t("cart.apply_coupon")}
                    </Button>
                  </div>
                )}

                <Link href="/checkout">
                  <Button size="lg" className="w-full h-12 font-bold text-base">
                    {t("cart.checkout")} <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
