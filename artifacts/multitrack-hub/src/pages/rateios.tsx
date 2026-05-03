import { Link } from "wouter";
import { useListRateios } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Users, Calendar, ArrowRight, Music, PlusCircle } from "lucide-react";
import { differenceInDays } from "date-fns";
import { useTranslation } from "react-i18next";

export default function RateiosList() {
  const { data: rateios, isLoading } = useListRateios();
  const { t } = useTranslation();

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
    const map: Record<string, string> = {
      suggested: t("rateios.status_suggested"),
      in_quotation: t("rateios.status_in_quotation"),
      open: t("rateios.status_open"),
      goal_reached: t("rateios.status_goal_reached"),
      awaiting_payment: t("rateios.status_awaiting_payment"),
      payment_confirmed: t("rateios.status_payment_confirmed"),
      in_progress: t("rateios.status_in_progress"),
      completed: t("rateios.status_completed"),
      cancelled: t("rateios.status_cancelled"),
      refunded: t("rateios.status_refunded"),
    };
    return map[status] || status;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow pb-24">
        <section className="bg-card border-b border-border py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">{t("rateios.title")}</h1>
            <p className="text-lg text-muted-foreground mb-8">{t("rateios.subtitle")}</p>
            <Button size="lg" className="h-12 px-8 font-bold">
              <PlusCircle className="mr-2 h-5 w-5" /> {t("rateios.suggest_btn")}
            </Button>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : !rateios || rateios.length === 0 ? (
            <div className="text-center py-24 bg-card/30 rounded-2xl border border-dashed border-border">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">{t("rateios.empty_title")}</h3>
              <p className="text-muted-foreground mb-6">{t("rateios.empty_desc")}</p>
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
                      <div className="absolute top-3 left-3">
                        <Badge className={getStatusColor(rateio.status)}>{getStatusText(rateio.status)}</Badge>
                      </div>
                      {rateio.isParticipating && (
                        <div className="absolute top-3 right-3">
                          <Badge variant="secondary" className="bg-background/90 backdrop-blur">{t("rateios.joined")}</Badge>
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
                          <span className="text-3xl font-extrabold">{formatCurrency(rateio.amountPerParticipant)}</span>
                          <span className="text-sm text-muted-foreground mb-1">{t("rateios.per_person")}</span>
                        </div>
                      )}
                      <div className="space-y-4 mb-8 flex-grow">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {t("rateios.progress", { current: rateio.currentParticipants, min: rateio.minParticipants || "?" })}
                            </span>
                            <span className="font-bold">{percentComplete}%</span>
                          </div>
                          <Progress value={percentComplete} className="h-2" />
                        </div>
                        {daysLeft !== null && rateio.status === "open" && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{t("rateios.deadline")}: {daysLeft}d</span>
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
