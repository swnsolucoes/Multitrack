import { useState } from "react";
import { useLocation } from "wouter";
import { useListProducts, useListCategories, ListProductsSort } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Catalog() {
  const { t } = useTranslation();
  const searchParams = new URLSearchParams(window.location.search);

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [categoryId, setCategoryId] = useState<string>(searchParams.get("categoryId") || "all");
  const [sort, setSort] = useState<ListProductsSort>((searchParams.get("sort") as ListProductsSort) || "recent");

  const { data: categories } = useListCategories();
  const { data, isLoading } = useListProducts({
    q: q || undefined,
    categoryId: categoryId !== "all" ? parseInt(categoryId) : undefined,
    sort,
    limit: 20,
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters */}
          <aside className="w-full md:w-64 shrink-0 space-y-8">
            <div>
              <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-primary" /> {t("catalog.filters")}
              </h2>
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground">{t("catalog.search_label")}</label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder={t("catalog.search_placeholder")} className="pl-9 bg-card" value={q} onChange={(e) => setQ(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground">{t("catalog.category_label")}</label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="bg-card"><SelectValue placeholder={t("catalog.all_categories")} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("catalog.all_categories")}</SelectItem>
                      {categories?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground">{t("catalog.sort_label")}</label>
                  <Select value={sort} onValueChange={(val: any) => setSort(val)}>
                    <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">{t("catalog.sort_recent")}</SelectItem>
                      <SelectItem value="popular">{t("catalog.sort_popular")}</SelectItem>
                      <SelectItem value="price_asc">{t("catalog.sort_price_asc")}</SelectItem>
                      <SelectItem value="price_desc">{t("catalog.sort_price_desc")}</SelectItem>
                      <SelectItem value="name_asc">{t("catalog.sort_name")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-grow">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold tracking-tight">{t("catalog.title")}</h1>
              <span className="text-sm text-muted-foreground">{t("catalog.results", { count: data?.total || 0 })}</span>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : data?.products && data.products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data.products.map(product => <ProductCard key={product.id} product={product} />)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-24 bg-card/30 rounded-xl border border-dashed border-border">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold mb-2">{t("catalog.empty_title")}</h3>
                <p className="text-muted-foreground max-w-md">{t("catalog.empty_desc")}</p>
                <Button variant="outline" className="mt-6" onClick={() => { setQ(""); setCategoryId("all"); setSort("recent"); }}>
                  {t("catalog.clear_filters")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
