import { Link } from "wouter";
import { useGetWishlist, useRemoveFromWishlist, getGetWishlistQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Heart, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useTranslation } from "react-i18next";

export default function Wishlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  const { data: wishlist, isLoading } = useGetWishlist({ query: { enabled: !!user } });
  const removeFromWishlist = useRemoveFromWishlist();

  const handleRemove = (productId: number) => {
    removeFromWishlist.mutate({ data: { productId } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
        toast({ title: t("product.remove_wishlist") });
      },
    });
  };

  if (!user) return (
    <div className="min-h-screen flex flex-col bg-background"><Navbar />
      <div className="flex-grow flex items-center justify-center p-4 text-center">
        <div><h2 className="text-2xl font-bold mb-4">{t("auth.login_btn")}</h2>
          <Link href="/login"><Button>{t("auth.login_btn")}</Button></Link></div>
      </div><Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12 max-w-6xl">
        <h1 className="text-3xl font-bold tracking-tight mb-8 flex items-center gap-3">
          <Heart className="h-8 w-8 text-primary" /> {t("wishlist.title")}
        </h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : !wishlist || wishlist.length === 0 ? (
          <div className="text-center py-24 bg-card/30 rounded-2xl border border-dashed border-border">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">{t("wishlist.empty_title")}</h3>
            <p className="text-muted-foreground mb-6">{t("wishlist.empty_desc")}</p>
            <Link href="/catalog"><Button>{t("wishlist.explore")}</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map(item => (
              <div key={item.id} className="relative group">
                <ProductCard product={item.product} />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemove(item.product.id); }}
                  disabled={removeFromWishlist.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
