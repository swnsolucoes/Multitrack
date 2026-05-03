import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-8xl font-extrabold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-4">{t("common.not_found_title")}</h2>
        <p className="text-muted-foreground mb-8">{t("common.not_found_desc")}</p>
        <Link href="/"><Button>{t("common.go_home")}</Button></Link>
      </div>
    </div>
  );
}
