import { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetRateio, useGetRateioComments, useJoinRateio, useAddRateioComment, getGetRateioQueryKey, getGetRateioCommentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import { Loader2, ArrowLeft, Users, Calendar, Music, MessageSquare, Send } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/AuthContext";

export default function RateioDetail() {
  const { id } = useParams();
  const rateioId = parseInt(id || "0");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [commentContent, setCommentContent] = useState("");

  const { data: rateio, isLoading: loadingRateio } = useGetRateio(rateioId, {
    query: { enabled: !!rateioId }
  });

  const { data: comments, isLoading: loadingComments } = useGetRateioComments(rateioId, {
    query: { enabled: !!rateioId }
  });

  const joinRateio = useJoinRateio();
  const addComment = useAddRateioComment();

  const handleJoin = () => {
    joinRateio.mutate(
      { data: { rateioId, paymentMethod: "pix" } }, // Default method for now
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetRateioQueryKey(rateioId) });
          toast({ title: "Participação confirmada!" });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Erro ao participar do rateio" });
        }
      }
    );
  };

  const handleAddComment = () => {
    if (!commentContent.trim()) return;
    
    addComment.mutate(
      { data: { rateioId, content: commentContent } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetRateioCommentsQueryKey(rateioId) });
          setCommentContent("");
          toast({ title: "Comentário adicionado" });
        }
      }
    );
  };

  if (loadingRateio) {
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

  if (!rateio) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-4 text-center">
          <div>
            <h2 className="text-2xl font-bold mb-4">Rateio não encontrado</h2>
            <Link href="/rateios"><Button>Voltar para Rateios</Button></Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const percentComplete = Math.min(100, Math.round((rateio.currentParticipants / (rateio.minParticipants || 1)) * 100));
  const daysLeft = rateio.deadline ? Math.max(0, differenceInDays(new Date(rateio.deadline), new Date())) : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-8">
          <Link href="/rateios" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Rateios
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* Main Info */}
            <div className="bg-card border border-border rounded-xl p-8 flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-48 aspect-square shrink-0 rounded-xl overflow-hidden bg-secondary border border-border">
                {rateio.coverUrl ? (
                  <img src={rateio.coverUrl} alt={rateio.songName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="h-16 w-16 text-muted-foreground opacity-20" />
                  </div>
                )}
              </div>
              
              <div className="flex-grow">
                <div className="flex gap-2 mb-3">
                  <Badge>{rateio.status}</Badge>
                  {rateio.genre && <Badge variant="outline">{rateio.genre}</Badge>}
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">{rateio.songName}</h1>
                <p className="text-xl text-muted-foreground mb-6">{rateio.artist}</p>
                
                {rateio.justification && (
                  <div className="prose prose-invert text-sm text-muted-foreground">
                    <p>{rateio.justification}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Comments / Updates */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" /> Atualizações e Comentários
              </h3>
              
              <div className="space-y-6 mb-8">
                {loadingComments ? (
                  <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : !comments || comments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Nenhum comentário ainda.</p>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className={`flex gap-4 p-4 rounded-xl ${comment.isAdmin ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/30'}`}>
                      <div className="w-10 h-10 rounded-full bg-secondary shrink-0 flex items-center justify-center font-bold">
                        {comment.userName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold">{comment.userName}</span>
                          {comment.isAdmin && <Badge variant="default" className="text-[10px] h-5 px-1.5">Admin</Badge>}
                          <span className="text-xs text-muted-foreground ml-2">
                            {format(new Date(comment.createdAt), "dd MMM HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {user && rateio.isParticipating && (
                <div className="flex gap-2">
                  <Textarea 
                    placeholder="Escreva um comentário..." 
                    className="min-h-[80px] bg-secondary/50"
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                  />
                  <Button 
                    className="shrink-0 h-auto" 
                    onClick={handleAddComment}
                    disabled={addComment.isPending || !commentContent.trim()}
                  >
                    {addComment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-6">Status do Rateio</h3>
              
              {rateio.amountPerParticipant && (
                <div className="mb-6 flex items-end gap-2">
                  <span className="text-4xl font-extrabold text-foreground">{formatCurrency(rateio.amountPerParticipant)}</span>
                  <span className="text-muted-foreground mb-1">/ pessoa</span>
                </div>
              )}
              
              <div className="space-y-4 mb-8">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users className="h-4 w-4" /> {rateio.currentParticipants} de {rateio.minParticipants} cotas
                    </span>
                    <span className="font-bold">{percentComplete}%</span>
                  </div>
                  <Progress value={percentComplete} className="h-3" />
                </div>
                
                {daysLeft !== null && rateio.status === 'open' && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Termina em <span className="font-bold">{daysLeft}</span> dias</span>
                  </div>
                )}
              </div>
              
              {!user ? (
                <Link href="/login">
                  <Button className="w-full h-12 font-bold">Faça login para participar</Button>
                </Link>
              ) : rateio.isParticipating ? (
                <div className="bg-green-500/10 text-green-500 border border-green-500/20 p-4 rounded-xl text-center">
                  <p className="font-bold mb-1">Você está participando!</p>
                  <p className="text-xs">Aguarde novas atualizações sobre a produção.</p>
                </div>
              ) : rateio.status === 'open' ? (
                <Button 
                  className="w-full h-12 font-bold text-lg" 
                  onClick={handleJoin}
                  disabled={joinRateio.isPending}
                >
                  {joinRateio.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Participar do Rateio"}
                </Button>
              ) : (
                <Button className="w-full h-12" disabled variant="outline">
                  Rateio Encerrado
                </Button>
              )}
            </div>
            
            {/* Participants list teaser */}
            {rateio.participants && rateio.participants.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bold mb-4 text-sm text-muted-foreground uppercase tracking-wider">Participantes</h3>
                <div className="flex flex-wrap gap-2">
                  {rateio.participants.slice(0, 10).map(p => (
                    <div key={p.id} className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-xs" title={p.userName}>
                      {p.userName.charAt(0)}
                    </div>
                  ))}
                  {rateio.participants.length > 10 && (
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                      +{rateio.participants.length - 10}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}