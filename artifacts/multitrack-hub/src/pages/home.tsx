import { useGetFeaturedProducts, useGetBestsellers, useListCategories } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Search, Music, Users, ArrowRight, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Home() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const { data: featuredProducts, isLoading: loadingFeatured } = useGetFeaturedProducts();
  const { data: bestsellers, isLoading: loadingBestsellers } = useGetBestsellers();
  const { data: categories, isLoading: loadingCategories } = useListCategories();

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/30">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[80vh]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-5 mix-blend-overlay" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        </div>

        <div className="container relative z-10 px-4 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 border border-border text-sm font-medium mb-8 backdrop-blur-sm">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">{t("home.badge")}</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 max-w-4xl text-foreground">
            {t("home.hero_title")} <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">{t("home.hero_highlight")}</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl">{t("home.hero_subtitle")}</p>

          <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-4 relative">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="search"
                placeholder={t("home.search_placeholder")}
                className="w-full h-14 pl-12 pr-4 rounded-xl bg-card border-2 border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-lg shadow-2xl"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value) setLocation(`/catalog?q=${e.currentTarget.value}`);
                }}
              />
            </div>
            <Link href="/catalog">
              <Button size="lg" className="h-14 px-8 text-base rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25">
                {t("home.explore_btn")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-20 bg-card/30 border-y border-border">
        <div className="container px-4 mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">{t("home.featured_title")}</h2>
              <p className="text-muted-foreground">{t("home.featured_subtitle")}</p>
            </div>
            <Link href="/catalog?sort=recent">
              <Button variant="ghost" className="hidden sm:flex group">
                {t("home.view_all")} <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          {loadingFeatured ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => <div key={i} className="animate-pulse bg-muted rounded-xl aspect-[3/4]" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts?.slice(0, 4).map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">{t("home.genres_title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t("home.genres_subtitle")}</p>
          </div>
          {loadingCategories ? (
            <div className="flex gap-4 justify-center flex-wrap">
              {[1,2,3,4,5].map(i => <div key={i} className="animate-pulse bg-muted w-32 h-12 rounded-full" />)}
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

      {/* Bestsellers */}
      <section className="py-20 bg-card/30 border-y border-border">
        <div className="container px-4 mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">{t("home.bestsellers_title")}</h2>
              <p className="text-muted-foreground">{t("home.bestsellers_subtitle")}</p>
            </div>
            <Link href="/catalog?sort=popular">
              <Button variant="ghost" className="hidden sm:flex group">
                {t("home.view_all")} <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          {loadingBestsellers ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => <div key={i} className="animate-pulse bg-muted rounded-xl aspect-[3/4]" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestsellers?.slice(0, 4).map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="container px-4 mx-auto relative z-10">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            {[
              { icon: Music, title: "home.feature1_title", desc: "home.feature1_desc" },
              { icon: Zap, title: "home.feature2_title", desc: "home.feature2_desc" },
              { icon: Users, title: "home.feature3_title", desc: "home.feature3_desc" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-6 text-primary shadow-lg shadow-primary/10">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">{t(title)}</h3>
                <p className="text-muted-foreground">{t(desc)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border">
        <div className="container px-4 mx-auto">
          <div className="bg-card border border-border rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">{t("home.cta_title")}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">{t("home.cta_subtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="h-12 px-8 font-bold text-base bg-primary text-primary-foreground hover:bg-primary/90">
                  {t("home.cta_register")}
                </Button>
              </Link>
              <Link href="/plans">
                <Button size="lg" variant="outline" className="h-12 px-8 font-bold text-base bg-background">
                  {t("home.cta_plans")}
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
