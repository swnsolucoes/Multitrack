import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/AuthContext";
import { useGetCart } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Search, User, LogOut, Globe } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

export function Navbar() {
  const [, setLocation] = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const { t, i18n } = useTranslation();

  const { data: cart } = useGetCart({ query: { enabled: !!user } });
  const cartItemCount = cart?.items?.length || 0;

  const toggleLang = () => {
    const next = i18n.language === "pt" ? "en" : "pt";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
  };

  return (
    <nav className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/">
            <div className="font-bold text-xl tracking-tighter cursor-pointer text-primary hover:text-primary/90 transition-colors">
              MULTITRACK<span className="text-foreground">HUB</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-4 text-sm font-medium text-muted-foreground">
            <Link href="/catalog" className="hover:text-foreground transition-colors">{t("nav.catalog")}</Link>
            <Link href="/plans" className="hover:text-foreground transition-colors">{t("nav.plans")}</Link>
            <Link href="/rateios" className="hover:text-foreground transition-colors">{t("nav.rateios")}</Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex relative w-60">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder={t("nav.search_placeholder")}
              className="w-full bg-muted/50 border border-border rounded-full h-9 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-background transition-all"
              onKeyDown={(e) => {
                if (e.key === "Enter") setLocation(`/catalog?q=${e.currentTarget.value}`);
              }}
            />
          </div>

          {/* Language toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLang}
            className="hidden sm:flex items-center gap-1.5 text-muted-foreground hover:text-foreground px-2 h-8 text-xs font-bold"
          >
            <Globe className="h-3.5 w-3.5" />
            {i18n.language === "pt" ? "EN" : "PT"}
          </Button>

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <>
                    <DropdownMenuItem onClick={() => setLocation("/admin")} className="cursor-pointer font-medium text-primary">
                      {t("nav.admin_panel")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => setLocation("/orders")} className="cursor-pointer">{t("nav.my_orders")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/downloads")} className="cursor-pointer">{t("nav.my_downloads")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/subscription")} className="cursor-pointer">{t("nav.my_subscription")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/wishlist")} className="cursor-pointer">{t("nav.wishlist")}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" className="hidden sm:flex">{t("nav.login")}</Button>
              </Link>
              <Link href="/register">
                <Button>{t("nav.register")}</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
