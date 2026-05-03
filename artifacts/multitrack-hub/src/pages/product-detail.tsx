import { useState, useRef } from "react";
import { useParams, Link } from "wouter";
import { useGetProduct, useGetRelatedProducts, useAddToCart, useAddToWishlist, getGetCartQueryKey, getGetWishlistQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Play, Pause, ShoppingCart, Heart, Download, Music, Clock, Activity, FileAudio, Users, Share2, Shield, Loader2 } from "lucide-react";

export default function ProductDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: product, isLoading } = useGetProduct(id, {
    query: {
      enabled: !!id,
    }
  });
  
  const { data: relatedProducts } = useGetRelatedProducts(id, {
    query: {
      enabled: !!id,
    }
  });

  const addToCartMutation = useAddToCart();
  const addToWishlistMutation = useAddToWishlist();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAddToCart = () => {
    addToCartMutation.mutate({ data: { productId: id } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast({
          title: "Adicionado ao carrinho",
          description: `${product?.name} foi adicionado ao seu carrinho.`,
        });
      }
    });
  };

  const handleAddToWishlist = () => {
    addToWishlistMutation.mutate({ data: { productId: id } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
        toast({
          title: "Adicionado aos favoritos",
          description: `${product?.name} foi salvo na sua lista de desejos.`,
        });
      }
    });
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

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-grow flex items-center justify-center text-center p-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Produto não encontrado</h1>
            <p className="text-muted-foreground mb-6">A multitrack que você está procurando não existe ou foi removida.</p>
            <Link href="/catalog">
              <Button>Voltar ao Catálogo</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow pb-24">
        {/* Product Header */}
        <section className="bg-card border-b border-border py-12 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start">
              {/* Cover Art */}
              <div className="w-full md:w-1/3 max-w-sm shrink-0">
                <div className="aspect-square rounded-2xl overflow-hidden border border-border shadow-2xl relative group">
                  {product.coverUrl ? (
                    <img src={product.coverUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary">
                      <Music className="h-24 w-24 text-muted-foreground opacity-20" />
                    </div>
                  )}
                  
                  {product.previewAudioUrl && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button size="icon" className="h-16 w-16 rounded-full bg-primary text-primary-foreground hover:scale-105 transition-transform" onClick={togglePlay}>
                        {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-2" />}
                      </Button>
                    </div>
                  )}
                  
                  {product.quality === "premium" && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/50 backdrop-blur-md">Premium</Badge>
                    </div>
                  )}
                </div>
                
                {product.previewAudioUrl && (
                  <div className="mt-6 bg-secondary/50 rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-4 mb-2">
                      <Button size="icon" variant="outline" className="h-10 w-10 shrink-0 rounded-full" onClick={togglePlay}>
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-1" />}
                      </Button>
                      <div className="flex-grow">
                        <div className="h-2 bg-background rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-1/3"></div>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">0:30</span>
                    </div>
                    <audio 
                      ref={audioRef} 
                      src={product.previewAudioUrl} 
                      onEnded={() => setIsPlaying(false)}
                      className="hidden" 
                    />
                  </div>
                )}
              </div>
              
              {/* Product Info */}
              <div className="flex-grow w-full">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge variant="outline">{product.genre}</Badge>
                  {product.category && <Badge variant="secondary">{product.category.name}</Badge>}
                  {product.isFeatured && <Badge className="bg-primary text-primary-foreground">Destaque</Badge>}
                </div>
                
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-foreground">{product.name}</h1>
                <p className="text-xl md:text-2xl text-muted-foreground mb-8">{product.artist}</p>
                
                <div className="flex flex-wrap gap-6 mb-8 text-sm bg-secondary/30 p-6 rounded-2xl border border-border/50">
                  {product.bpm && (
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      <div>
                        <div className="text-muted-foreground">BPM</div>
                        <div className="font-bold">{product.bpm}</div>
                      </div>
                    </div>
                  )}
                  {product.tonality && (
                    <div className="flex items-center gap-2">
                      <Music className="h-5 w-5 text-primary" />
                      <div>
                        <div className="text-muted-foreground">Tom</div>
                        <div className="font-bold">{product.tonality}</div>
                      </div>
                    </div>
                  )}
                  {product.duration && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <div className="text-muted-foreground">Duração</div>
                        <div className="font-bold">{product.duration}</div>
                      </div>
                    </div>
                  )}
                  {product.fileSizeMb && (
                    <div className="flex items-center gap-2">
                      <Download className="h-5 w-5 text-primary" />
                      <div>
                        <div className="text-muted-foreground">Tamanho</div>
                        <div className="font-bold">{product.fileSizeMb} MB</div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Purchase Options */}
                <div className="bg-card border border-border p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
                  <div>
                    {product.promoPrice ? (
                      <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-extrabold text-primary">{formatCurrency(product.promoPrice)}</span>
                        <span className="text-lg text-muted-foreground line-through">{formatCurrency(product.price)}</span>
                      </div>
                    ) : (
                      <span className="text-4xl font-extrabold text-foreground">{formatCurrency(product.price)}</span>
                    )}
                    {product.availableForSubscription && (
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        ou <span className="font-bold text-foreground">{product.creditsRequired} créditos</span> na assinatura
                      </p>
                    )}
                  </div>
                  
                  <div className="flex w-full md:w-auto gap-3">
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className="h-14 w-14 shrink-0 rounded-xl"
                      onClick={handleAddToWishlist}
                      disabled={addToWishlistMutation.isPending}
                    >
                      <Heart className="h-6 w-6" />
                    </Button>
                    <Button 
                      className="flex-grow md:w-48 h-14 rounded-xl text-lg font-bold"
                      onClick={handleAddToCart}
                      disabled={addToCartMutation.isPending}
                    >
                      {addToCartMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                        <>
                          <ShoppingCart className="mr-2 h-5 w-5" />
                          Adicionar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Tabs area */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-12">
              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="text-2xl font-bold mb-4">Sobre a Multitrack</h3>
                  <div className="prose prose-invert max-w-none text-muted-foreground">
                    <p>{product.description}</p>
                  </div>
                </div>
              )}

              {/* Tracks List */}
              {product.tracks && product.tracks.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <FileAudio className="h-6 w-6 text-primary" /> Pistas Inclusas
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.tracks.map((track, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
                        <div className="h-8 w-8 rounded bg-background flex items-center justify-center text-xs font-mono text-muted-foreground shrink-0 border border-border">
                          {(i + 1).toString().padStart(2, '0')}
                        </div>
                        <span className="font-medium text-sm">{track}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-secondary/20 border border-border rounded-xl p-6">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" /> Garantia
                </h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 shrink-0 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] mt-0.5">✓</div>
                    <span>Download imediato após aprovação do pagamento.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 shrink-0 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] mt-0.5">✓</div>
                    <span>Arquivos em WAV 24-bit/44.1kHz (alta resolução).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 shrink-0 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] mt-0.5">✓</div>
                    <span>Compatível com Ableton Live, Logic Pro, Pro Tools, Reaper, etc.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-secondary/20 border border-border rounded-xl p-6">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-primary" /> Compartilhar
                </h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="w-full">Copiar Link</Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section className="container mx-auto px-4 py-16 border-t border-border">
            <h2 className="text-3xl font-bold tracking-tight mb-8">Você também pode gostar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(rp => (
                <ProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}