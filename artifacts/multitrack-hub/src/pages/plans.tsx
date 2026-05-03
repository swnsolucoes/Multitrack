import { useListPlans, useSubscribe } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Check, Zap, Users } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Plans() {
  const { data: plans, isLoading } = useListPlans();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const subscribeMutation = useSubscribe();

  const handleSubscribe = (planId: number, isFree: boolean) => {
    if (!user) {
      setLocation("/register");
      return;
    }
    if (isFree) {
      setLocation("/rateios");
      return;
    }
    subscribeMutation.mutate(
      { data: { planId, paymentMethod: "credit_card" } },
      {
        onSuccess: () => {
          toast({ title: "Assinatura realizada com sucesso!" });
          setLocation("/subscription");
        },
        onError: () => {
          toast({ variant: "destructive", title: "Erro ao assinar plano" });
        },
      }
    );
  };

  // Sort: free first, then paid ascending
  const sorted = plans
    ? [...plans].sort((a, b) => parseFloat(String(a.price)) - parseFloat(String(b.price)))
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow pb-24">
        {/* Header */}
        <section className="pt-20 pb-16 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Música premium,{" "}
              <span className="text-primary">sem limites.</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Comece grátis e participe de rateios. Assine para receber créditos
              mensais e baixar as melhores multitracks do Brasil pagando até 70%
              menos.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="container mx-auto px-4 relative z-10">
          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div
              className={`grid gap-8 max-w-5xl mx-auto ${
                sorted.length === 1
                  ? "max-w-sm"
                  : sorted.length === 2
                  ? "md:grid-cols-2"
                  : "md:grid-cols-3"
              }`}
            >
              {sorted.map((plan) => {
                const isFree = parseFloat(String(plan.price)) === 0;
                const isPremium = !isFree;

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-3xl p-8 flex flex-col border transition-all ${
                      isPremium
                        ? "bg-card border-primary shadow-2xl shadow-primary/20 scale-105 z-10"
                        : "bg-card border-border"
                    }`}
                  >
                    {isPremium && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground font-bold px-4 py-1 text-sm rounded-full">
                          <Zap className="w-4 h-4 mr-1 fill-current" /> Mais
                          Popular
                        </Badge>
                      </div>
                    )}

                    {isFree && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Badge
                          variant="outline"
                          className="border-muted-foreground/40 text-muted-foreground font-semibold px-4 py-1 text-sm rounded-full bg-background"
                        >
                          <Users className="w-4 h-4 mr-1" /> Para Rateios
                        </Badge>
                      </div>
                    )}

                    <div className="mb-6 mt-2">
                      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground min-h-[40px]">
                        {plan.description}
                      </p>
                    </div>

                    <div className="mb-8">
                      <div className="flex items-baseline gap-1">
                        {isFree ? (
                          <span className="text-5xl font-extrabold text-foreground">
                            Grátis
                          </span>
                        ) : (
                          <>
                            <span className="text-5xl font-extrabold text-foreground">
                              {formatCurrency(plan.price)}
                            </span>
                            <span className="text-muted-foreground font-medium">
                              /mês
                            </span>
                          </>
                        )}
                      </div>
                      {!isFree && (
                        <div className="mt-2 text-sm font-bold text-primary">
                          Receba {plan.creditsPerMonth} créditos por mês
                        </div>
                      )}
                      {isFree && (
                        <div className="mt-2 text-sm font-medium text-muted-foreground">
                          Sem mensalidade, sem compromisso
                        </div>
                      )}
                    </div>

                    <ul className="space-y-4 mb-8 flex-grow">
                      {plan.features?.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="mt-0.5 shrink-0 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <Check className="h-3 w-3" />
                          </div>
                          <span className="text-sm text-muted-foreground leading-snug">
                            {feature}
                          </span>
                        </li>
                      ))}
                      {!isFree && plan.maxAccumulatedCredits > 0 && (
                        <li className="flex items-start gap-3">
                          <div className="mt-0.5 shrink-0 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <Check className="h-3 w-3" />
                          </div>
                          <span className="text-sm text-muted-foreground leading-snug">
                            Acumule até {plan.maxAccumulatedCredits} créditos
                          </span>
                        </li>
                      )}
                    </ul>

                    <Button
                      className={`w-full h-12 font-bold text-base ${
                        isPremium
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : ""
                      }`}
                      variant={isPremium ? "default" : "outline"}
                      onClick={() => handleSubscribe(plan.id, isFree)}
                      disabled={
                        !isFree &&
                        subscribeMutation.isPending &&
                        subscribeMutation.variables?.data.planId === plan.id
                      }
                    >
                      {!isFree &&
                      subscribeMutation.isPending &&
                      subscribeMutation.variables?.data.planId === plan.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : isFree ? (
                        user ? "Explorar Rateios" : "Criar Conta Grátis"
                      ) : (
                        "Assinar Premium"
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Rateio callout */}
        <section className="container mx-auto px-4 pt-20 pb-4 max-w-3xl text-center">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-8">
            <Users className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">O que são Rateios?</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Rateios são compras coletivas: um grupo de músicos se une para
              encomendar a produção de uma multitrack que ainda não existe no
              catálogo. O custo total é dividido entre os participantes — você
              paga uma fração do valor e, quando a meta é atingida, todos
              recebem a multitrack completa. O plano Gratuito já te dá acesso
              total para sugerir e participar de rateios.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="container mx-auto px-4 py-16 max-w-3xl text-center">
          <h2 className="text-2xl font-bold mb-4">Como funcionam os créditos?</h2>
          <p className="text-muted-foreground">
            Ao assinar o plano Premium, você recebe créditos mensalmente. A
            maioria das multitracks custa 1 crédito — você usa para baixar
            permanentemente. Se não usar todos os créditos no mês, eles
            acumulam para o mês seguinte (até o limite do plano).
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
