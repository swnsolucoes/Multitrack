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

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credit_card">("pix");
  
  const { data: cart, isLoading: isCartLoading } = useGetCart();
  const createOrder = useCreateOrder();

  const handleConfirmOrder = () => {
    if (!cart || cart.items.length === 0) return;
    
    createOrder.mutate(
      { data: { paymentMethod, couponCode: cart.couponCode } },
      {
        onSuccess: (order) => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          toast({ title: "Pedido criado com sucesso!" });
          setLocation(`/orders/${order.id}`);
        },
        onError: () => {
          toast({ variant: "destructive", title: "Erro ao criar pedido" });
        }
      }
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Você precisa estar logado</h2>
          <p className="text-muted-foreground mb-8">Faça login ou crie uma conta para finalizar sua compra.</p>
          <div className="flex gap-4">
            <Link href="/login"><Button>Fazer Login</Button></Link>
            <Link href="/register"><Button variant="outline">Criar Conta</Button></Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isCartLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h2>
          <Link href="/catalog"><Button>Voltar às compras</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Finalizar Compra</h1>
        
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-4">Método de Pagamento</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                    paymentMethod === "pix" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
                  }`}
                  onClick={() => setPaymentMethod("pix")}
                >
                  <QrCode className={`h-8 w-8 mb-2 ${paymentMethod === "pix" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="font-bold">PIX</span>
                  <span className="text-xs text-muted-foreground mt-1">Aprovação imediata</span>
                </button>
                <button
                  className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                    paymentMethod === "credit_card" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
                  }`}
                  onClick={() => setPaymentMethod("credit_card")}
                >
                  <CreditCard className={`h-8 w-8 mb-2 ${paymentMethod === "credit_card" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="font-bold">Cartão de Crédito</span>
                  <span className="text-xs text-muted-foreground mt-1">Em até 12x</span>
                </button>
              </div>
            </section>
            
            {paymentMethod === "credit_card" && (
              <section className="bg-card border border-border p-6 rounded-xl">
                <h3 className="font-bold mb-4">Dados do Cartão</h3>
                <div className="space-y-4 text-muted-foreground text-sm">
                  <p>Formulário de cartão simulado (na vida real usaria Stripe/Pagar.me elements)</p>
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
              <h3 className="font-bold text-lg mb-6">Resumo do Pedido</h3>
              
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
                  <span>Subtotal</span>
                  <span>{formatCurrency(cart.subtotal)}</span>
                </div>
                {cart.couponCode && (
                  <div className="flex justify-between text-primary">
                    <span>Desconto ({cart.couponCode})</span>
                    <span>-{formatCurrency(cart.discount || cart.couponDiscount || 0)}</span>
                  </div>
                )}
                <div className="border-t border-border pt-4 flex justify-between items-center">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-3xl text-primary">{formatCurrency(cart.total)}</span>
                </div>
              </div>
              
              <Button 
                size="lg" 
                className="w-full h-14 mt-8 font-bold text-lg"
                onClick={handleConfirmOrder}
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                  <>
                    Confirmar Pagamento
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
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