import { useParams, Link } from "wouter";
import { useGetOrder, usePayOrder, getGetOrderQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Loader2, ArrowLeft, Download, CreditCard, QrCode } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function OrderDetail() {
  const { id } = useParams();
  const orderId = parseInt(id || "0");
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { enabled: !!orderId }
  });

  const payOrder = usePayOrder();

  const handlePay = () => {
    payOrder.mutate(
      { data: { paymentMethod: "pix" } }, // Defaulting for demo
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(orderId) });
        }
      }
    );
  };

  if (isLoading) {
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

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-4 text-center">
          <div>
            <h2 className="text-2xl font-bold mb-4">Pedido não encontrado</h2>
            <Link href="/orders"><Button>Voltar para pedidos</Button></Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-500/20 text-green-500 border-green-500/50";
      case "pending": return "bg-amber-500/20 text-amber-500 border-amber-500/50";
      case "cancelled": return "bg-destructive/20 text-destructive border-destructive/50";
      default: return "bg-secondary text-foreground";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <Link href="/orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Meus Pedidos
          </Link>
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                Pedido #{order.id.toString().padStart(5, '0')}
                <Badge variant="outline" className={getStatusColor(order.status)}>
                  {order.status === "paid" ? "Aprovado" : order.status === "pending" ? "Pendente" : "Cancelado"}
                </Badge>
              </h1>
              <p className="text-muted-foreground mt-2">
                Realizado em {format(new Date(order.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            
            {order.status === "pending" && (
              <Button onClick={handlePay} disabled={payOrder.isPending} className="font-bold">
                {payOrder.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Pagar Agora"}
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-6 border-b border-border bg-secondary/20">
                <h3 className="font-bold">Itens do Pedido ({order.itemCount})</h3>
              </div>
              <div className="divide-y divide-border">
                {order.items?.map(item => (
                  <div key={item.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-16 h-16 shrink-0 rounded bg-secondary overflow-hidden border border-border">
                      {item.product.coverUrl ? (
                        <img src={item.product.coverUrl} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-muted"></div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <Link href={`/products/${item.product.id}`}>
                        <h4 className="font-bold hover:text-primary cursor-pointer">{item.product.name}</h4>
                      </Link>
                      <p className="text-sm text-muted-foreground">{item.product.artist}</p>
                    </div>
                    <div className="text-right w-full sm:w-auto flex flex-row sm:flex-col items-center justify-between sm:items-end mt-4 sm:mt-0">
                      <span className="font-bold">{formatCurrency(item.price)}</span>
                      
                      {order.status === "paid" && (
                        <Link href="/downloads" className="mt-2 block">
                          <Button size="sm" variant="secondary" className="h-8">
                            <Download className="h-3 w-3 mr-2" /> Baixar
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold mb-4">Resumo Financeiro</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Desconto</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="font-bold">Total Pago</span>
                  <span className="font-bold text-xl text-primary">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold mb-4">Forma de Pagamento</h3>
              <div className="flex items-center gap-3">
                {order.paymentMethod === "pix" ? (
                  <QrCode className="h-6 w-6 text-muted-foreground" />
                ) : (
                  <CreditCard className="h-6 w-6 text-muted-foreground" />
                )}
                <span className="capitalize">{order.paymentMethod === "credit_card" ? "Cartão de Crédito" : "PIX"}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}