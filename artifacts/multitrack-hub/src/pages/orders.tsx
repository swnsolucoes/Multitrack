import { Link } from "wouter";
import { useListOrders } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Package, ArrowRight, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Orders() {
  const { data: orders, isLoading } = useListOrders();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-500/20 text-green-500 border-green-500/50";
      case "pending": return "bg-amber-500/20 text-amber-500 border-amber-500/50";
      case "cancelled": return "bg-destructive/20 text-destructive border-destructive/50";
      default: return "bg-secondary text-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid": return "Aprovado";
      case "pending": return "Pendente";
      case "cancelled": return "Cancelado";
      case "refunded": return "Reembolsado";
      default: return status;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Minhas Compras</h1>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="text-center py-24 bg-card/30 rounded-2xl border border-dashed border-border">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">Nenhum pedido encontrado</h3>
            <p className="text-muted-foreground mb-6">Você ainda não fez nenhuma compra.</p>
            <Link href="/catalog"><Button>Explorar Catálogo</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-card border border-border rounded-xl p-6 transition-all hover:border-primary/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-lg">Pedido #{order.id.toString().padStart(5, '0')}</h3>
                      <Badge variant="outline" className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">{order.itemCount} {order.itemCount === 1 ? 'item' : 'itens'}</p>
                    <p className="font-bold text-xl text-primary">{formatCurrency(order.total)}</p>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4 border-t border-border">
                  <Link href={`/orders/${order.id}`}>
                    <Button variant="ghost" className="text-primary hover:text-primary/80">
                      Ver detalhes
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}