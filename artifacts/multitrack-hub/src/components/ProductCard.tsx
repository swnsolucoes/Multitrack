import { Link } from "wouter";
import { Product } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Play, Heart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="overflow-hidden bg-card/50 border-border hover:border-primary/50 transition-all duration-300 group flex flex-col h-full">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.coverUrl ? (
          <img src={product.coverUrl} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <span className="text-4xl text-muted-foreground font-bold tracking-tighter opacity-20">MTH</span>
          </div>
        )}

        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {product.isFeatured && (
            <Badge variant="default" className="bg-primary text-primary-foreground shadow-lg">{t("product.featured")}</Badge>
          )}
          {product.quality === "premium" && (
            <Badge variant="secondary" className="bg-amber-500/20 text-amber-500 border-amber-500/50 backdrop-blur-md">Premium</Badge>
          )}
        </div>

        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
          <Button size="icon" variant="secondary" className="rounded-full w-12 h-12 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Play className="h-5 w-5 ml-1" />
          </Button>
        </div>
      </div>

      <CardContent className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div className="truncate pr-4">
            <h3 className="font-bold text-lg leading-tight truncate text-foreground">{product.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{product.artist}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground hover:text-destructive">
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <span>{product.bpm} BPM</span>
          <span>&bull;</span>
          <span>{product.tonality}</span>
          <span>&bull;</span>
          <span className="truncate">{product.genre}</span>
        </div>

        <div className="mt-auto flex items-end justify-between">
          <div>
            {product.promoPrice ? (
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground line-through">{formatCurrency(product.price)}</span>
                <span className="font-bold text-lg text-primary">{formatCurrency(product.promoPrice)}</span>
              </div>
            ) : (
              <span className="font-bold text-lg text-foreground">{formatCurrency(product.price)}</span>
            )}
          </div>
          {product.availableForSubscription && (
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary/80">
              {product.creditsRequired} {t("product.credits")}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2">
        <Link href={`/products/${product.id}`} className="w-full">
          <Button variant="outline" className="w-full text-xs h-9">{t("product.details")}</Button>
        </Link>
        <Button size="icon" className="h-9 w-10 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90">
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
