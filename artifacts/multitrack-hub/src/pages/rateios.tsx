import { Link } from "wouter";
import { useListRateios, RateioStatus } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Users, Calendar, ArrowRight, Music, PlusCircle } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function RateiosList() {
  const { data: rateios, isLoading } = useListRateios();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-primary text-primary-foreground";
      case "goal_reached": return "bg-green-500/20 text-green-500 border-green-500/50";
      case "awaiting_payment": return "bg-amber-500/20 text-amber-500 border-amber-500/50";
      case "in_progress": return "bg-blue-500/20 text-blue-500 border-blue-500/50";
      case "completed": return "bg-secondary text-foreground";
      default: return "bg-secondary text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "suggested": return "Sugerido";
      case "in_quotation": return "Em Cotação";
      case "open": return "Aberto";
      case "goal_reached": return "Meta Atingida";
      case "awaiting_payment": return "Aguardando Pagamento";
      case "payment_confirmed": return "Pagamento Confirmado";
      case "in_progress": return "Em Produção";
      case "completed": return "Concluído";
      case "cancelled": return "Cancelado";
      case "refunded": return "Reembolsado";
      default: return status;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow pb-24">
        {/* Header */}
        <section className="bg-card border-b border-border py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none"></div>
          <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Rateios Coletivos</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Junte-se a outros músicos para encomendar a produção de multitracks que ainda não estão no catálogo por uma fração do preço.
            </p>
            <Button size="lg" className="h-12 px-8 font-bold">
              <PlusCircle className="mr-2 h-5 w-5" /> Sugerir Música
            </Button>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : !rateios || rateios.length === 0 ? (
            <div className="text-center py-24 bg-card/30 rounded-2xl border border-dashed border-border">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">Nenhum rateio ativo no momento</h3>
              <p className="text-muted-foreground mb-6">Seja o primeiro a sugerir uma nova produção!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rateios.map(rateio => {
                const percentComplete = Math.min(100, Math.round((rateio.currentParticipants / (rateio.minParticipants || 1)) * 100));
                const daysLeft = rateio.deadline ? Math.max(0, differenceInDays(new Date(rateio.deadline), new Date())) : null;

                return (
                  <div key={rateio.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all flex flex-col group">
                    <div className="relative aspect-video bg-secondary border-b border-border">
                      {rateio.coverUrl ? (
                        <img src={rateio.coverUrl} alt={rateio.songName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="h-12 w-12 text-muted-foreground opacity-20" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <Badge className={getStatusColor(rateio.status)}>{getStatusText(rateio.status)}</Badge>
                      </div>
                      {rateio.isParticipating && (
                        <div className="absolute top-3 right-3">
                          <Badge variant="secondary" className="bg-background/90 backdrop-blur">Participando</Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 flex-grow flex flex-col">
                      <div className="mb-6">
                        <h3 className="font-bold text-xl mb-1 line-clamp-1">{rateio.songName}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-1">{rateio.artist}</p>
                      </div>
                      
                      {rateio.amountPerParticipant && (
                        <div className="flex items-end gap-2 mb-6">
                          <span className="text-3xl font-extrabold text-foreground">{formatCurrency(rateio.amountPerParticipant)}</span>
                          <span className="text-sm text-muted-foreground mb-1">/ pessoa</span>
                        </div>
                      )}
                      
                      <div className="space-y-4 mb-8 flex-grow">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground flex items-center gap-1"><Users className="h-4 w-4" /> {rateio.currentParticipants} de {rateio.minParticipants}</span>
                            <span className="font-bold">{percentComplete}%</span>
                          </div>
                          <Progress value={percentComplete} className="h-2" />
                        </div>
                        
                        {daysLeft !== null && rateio.status === 'open' && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Termina em {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}</span>
                          </div>
                        )}
                      </div>
                      
                      <Link href={`/rateios/${rateio.id}`} className="mt-auto w-full">
                        <Button className="w-full">
                          Ver Detalhes <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}