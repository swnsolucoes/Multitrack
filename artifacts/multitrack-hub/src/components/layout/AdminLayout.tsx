import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, ShoppingCart, Users, Ticket, LogOut, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { logout, user } = useAuth();
  const { t } = useTranslation();

  const navigation = [
    { name: t("admin.dashboard"), href: "/admin", icon: LayoutDashboard },
    { name: t("admin.products"), href: "/admin/products", icon: Package },
    { name: t("admin.orders"), href: "/admin/orders", icon: ShoppingCart },
    { name: t("admin.users"), href: "/admin/users", icon: Users },
    { name: t("admin.rateios"), href: "/admin/rateios", icon: Users },
    { name: t("admin.coupons"), href: "/admin/coupons", icon: Ticket },
    { name: t("admin.credits"), href: "/admin/credits", icon: Ticket },
  ];

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t("admin.access_denied")}</h1>
          <p className="text-muted-foreground mb-4">{t("admin.access_denied_desc")}</p>
          <Link href="/"><Button>{t("admin.back_home")}</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 border-r border-border bg-card flex flex-col hidden md:flex shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/admin">
            <div className="font-bold text-xl tracking-tighter cursor-pointer text-primary">
              ADMIN<span className="text-foreground">MTH</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navigation.map((item) => {
              const isActive = location === item.href || (location.startsWith(item.href) && item.href !== "/admin");
              return (
                <li key={item.name}>
                  <Link href={item.href}>
                    <div className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}>
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4 px-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="flex-1">
              <Button variant="outline" size="sm" className="w-full justify-center">
                <Home className="h-4 w-4 mr-2" /> {t("admin.site")}
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => logout()} className="text-destructive hover:bg-destructive/10 shrink-0">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 md:hidden flex items-center justify-between px-4 border-b border-border bg-card">
          <div className="font-bold text-lg tracking-tighter text-primary">ADMIN<span className="text-foreground">MTH</span></div>
          <Link href="/"><Button variant="ghost" size="sm"><Home className="h-4 w-4" /></Button></Link>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
