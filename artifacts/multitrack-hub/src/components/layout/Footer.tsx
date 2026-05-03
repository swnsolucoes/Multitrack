import { Link } from "wouter";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <Link href="/">
              <div className="font-bold text-xl tracking-tighter cursor-pointer text-primary mb-4">
                MULTITRACK<span className="text-foreground">HUB</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">{t("footer.tagline")}</p>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-4">{t("nav.catalog")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/catalog" className="hover:text-primary transition-colors">{t("footer.catalog")}</Link></li>
              <li><Link href="/plans" className="hover:text-primary transition-colors">{t("footer.plans")}</Link></li>
              <li><Link href="/rateios" className="hover:text-primary transition-colors">{t("footer.rateios")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-4">{t("footer.account")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-primary transition-colors">{t("footer.login")}</Link></li>
              <li><Link href="/register" className="hover:text-primary transition-colors">{t("footer.register")}</Link></li>
              <li><Link href="/orders" className="hover:text-primary transition-colors">{t("footer.orders")}</Link></li>
              <li><Link href="/downloads" className="hover:text-primary transition-colors">{t("footer.downloads")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-4">Suporte / Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Use</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} MultiTrack Hub. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
