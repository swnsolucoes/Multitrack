import { useGetFeaturedProducts, useGetBestsellers, useListCategories } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Search, Play, Music, Users, ArrowRight, Zap } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: featuredProducts, isLoading: loadingFeatured } = useGetFeaturedProducts();
  const { data: bestsellers, isLoading: loadingBestsellers } = useGetBestsellers();
  const { data: categories, isLoading: loadingCategories } = useListCategories();

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/30">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[80vh]">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-5 mix-blend-overlay"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>
        </div>
        
        <div className="container relative z-10 px-4 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 border border-border text-sm font-medium mb-8 backdrop-blur-sm">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Nova plataforma de multitracks</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 max-w-4xl text-foreground">
            Sua música com <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">qualidade de estúdio.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl">
            As melhores multitracks para ministérios de louvor, bandas e produtores. 
            Baixe, importe para sua DAW e eleve sua performance ao vivo.
          </p>
          
          <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-4 relative">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input 
                type="search"
                placeholder="Buscar música, artista, gênero..."
                className="w-full h-14 pl-12 pr-4 rounded-xl bg-card border-2 border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-lg shadow-2xl"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    setLocation(`/catalog?q=${e.currentTarget.value}`);
                  }
                }}
              />
            </div>
            <Link href="/catalog">
              <Button size="lg" className="h-14 px-8 text-base rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25">
                Explorar Catálogo
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Featured Section */}
      <section className="py-20 bg-card/30 border-y border-border">
        <div className="container px-4 mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Lançamentos em Destaque</h2>
              <p className="text-muted-foreground">As multitracks mais recentes adicionadas à plataforma.</p>
            </div>
            <Link href="/catalog?sort=recent">
              <Button variant="ghost" className="hidden sm:flex group">
                Ver todos <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          {loadingFeatured ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse bg-muted rounded-xl aspect-[3/4]"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts?.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Categories / Genres */}
      <section className="py-20">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Navegue por Gêneros</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Encontre exatamente o que você procura para o seu repertório.</p>
          </div>
          
          {loadingCategories ? (
            <div className="flex gap-4 justify-center flex-wrap">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="animate-pulse bg-muted w-32 h-12 rounded-full"></div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4">
              {categories?.map(category => (
                <Link key={category.id} href={`/catalog?categoryId=${category.id}`}>
                  <div className="px-6 py-3 rounded-full bg-secondary border border-border hover:border-primary hover:text-primary transition-colors cursor-pointer font-medium">
                    {category.name} <span className="text-xs text-muted-foreground ml-2">({category.productCount})</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="py-20 bg-card/30 border-y border-border">
        <div className="container px-4 mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Mais Vendidos</h2>
              <p className="text-muted-foreground">As multitracks mais populares da nossa comunidade.</p>
            </div>
            <Link href="/catalog?sort=popular">
              <Button variant="ghost" className="hidden sm:flex group">
                Ver todos <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          {loadingBestsellers ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse bg-muted rounded-xl aspect-[3/4]"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestsellers?.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features/Explanation */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5"></div>
        <div className="container px-4 mx-auto relative z-10">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-6 text-primary shadow-lg shadow-primary/10">
                <Music className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Qualidade Premium</h3>
              <p className="text-muted-foreground">Multitracks gravadas em estúdios profissionais, separadas por instrumentos para total controle na sua DAW.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-6 text-primary shadow-lg shadow-primary/10">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Assinatura Mensal</h3>
              <p className="text-muted-foreground">Economize até 70% assinando nossos planos. Receba créditos mensais para baixar qualquer multitrack do catálogo.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-6 text-primary shadow-lg shadow-primary/10">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Rateio Coletivo</h3>
              <p className="text-muted-foreground">Quer uma música que não está no catálogo? Sugira um rateio, divida o custo de produção com outros músicos e receba a track.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-border">
        <div className="container px-4 mx-auto">
          <div className="bg-card border border-border rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Pronto para elevar seu som?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Junte-se a milhares de músicos e produtores que já usam o MultiTrack Hub para criar experiências musicais inesquecíveis.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="h-12 px-8 font-bold text-base bg-primary text-primary-foreground hover:bg-primary/90">
                  Criar Conta Grátis
                </Button>
              </Link>
              <Link href="/plans">
                <Button size="lg" variant="outline" className="h-12 px-8 font-bold text-base bg-background">
                  Conhecer Planos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}