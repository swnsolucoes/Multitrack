import { useListDownloads, useGenerateDownloadLink } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Music } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

export default function Downloads() {
  const { data: downloads, isLoading } = useListDownloads();
  const generateLink = useGenerateDownloadLink();
  const { t } = useTranslation();

  const handleDownload = (id: number) => {
    generateLink.mutate({ grantId: id }, {
      onSuccess: (linkData) => { window.open(linkData.url, "_blank"); },
    });
  };

  const getSourceLabel = (source: string) => {
    const map: Record<string, string> = {
      purchase: t("downloads.source_purchase"),
      credit: t("downloads.source_credit"),
      rateio: t("downloads.source_rateio"),
    };
    return map[source] || source;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("downloads.title")}</h1>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : !downloads || downloads.length === 0 ? (
          <div className="text-center py-24 bg-card/30 rounded-2xl border border-dashed border-border">
            <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">{t("downloads.empty_title")}</h3>
            <p className="text-muted-foreground mb-6">{t("downloads.empty_desc")}</p>
            <Link href="/catalog"><Button>{t("downloads.explore")}</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {downloads.map((grant) => (
              <div key={grant.id} className="bg-card border border-border rounded-xl overflow-hidden group hover:border-primary/50 transition-colors flex flex-col">
                <div className="relative aspect-video bg-muted border-b border-border">
                  {grant.coverUrl ? (
                    <img src={grant.coverUrl} alt={grant.productName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary">
                      <Music className="h-12 w-12 text-muted-foreground opacity-20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button onClick={() => handleDownload(grant.productId)} className="rounded-full shadow-xl">
                      <Download className="h-4 w-4 mr-2" /> {t("downloads.download_btn")}
                    </Button>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur border-border text-[10px]">
                      {getSourceLabel(grant.source)}
                    </Badge>
                  </div>
                </div>
                <div className="p-5 flex-grow flex flex-col">
                  <div className="mb-4">
                    <Link href={`/products/${grant.productId}`}>
                      <h3 className="font-bold text-lg leading-tight hover:text-primary transition-colors cursor-pointer line-clamp-1">{grant.productName}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground">{grant.productArtist}</p>
                  </div>
                  <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t("wishlist.added")} {format(new Date(grant.createdAt), "dd/MM/yyyy")}</span>
                    <span className="flex items-center gap-1">
                      <Download className="h-3 w-3" /> {t("downloads.times", { count: grant.downloadCount })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
