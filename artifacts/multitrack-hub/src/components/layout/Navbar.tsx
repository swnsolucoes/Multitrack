import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/AuthContext";
import { useGetCart } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, Search, User, LogOut } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { user, logout, isAdmin } = useAuth();
  
  const { data: cart } = useGetCart({
    query: {
      enabled: !!user,
    }
  });

  const cartItemCount = cart?.items?.length || 0;

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
            <Link href="/catalog" className="hover:text-foreground transition-colors">Catálogo</Link>
            <Link href="/plans" className="hover:text-foreground transition-colors">Planos</Link>
            <Link href="/rateios" className="hover:text-foreground transition-colors">Rateios</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              type="search" 
              placeholder="Buscar multitracks..." 
              className="w-full bg-muted/50 border border-border rounded-full h-9 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-background transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setLocation(`/catalog?q=${e.currentTarget.value}`);
                }
              }}
            />
          </div>

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
                      Painel Admin
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => setLocation("/orders")} className="cursor-pointer">
                  Minhas Compras
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/downloads")} className="cursor-pointer">
                  Meus Downloads
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/subscription")} className="cursor-pointer">
                  Minha Assinatura
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/wishlist")} className="cursor-pointer">
                  Lista de Desejos
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" className="hidden sm:flex">Entrar</Button>
              </Link>
              <Link href="/register">
                <Button>Criar Conta</Button>
              </Link>
            </div>
          )}

          <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}