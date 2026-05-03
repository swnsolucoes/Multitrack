import { useListDownloads, useGenerateDownloadLink } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Music, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "wouter";

export default function Downloads() {
  const { data: downloads, isLoading } = useListDownloads();
  const generateLink = useGenerateDownloadLink();

  const handleDownload = (id: number) => {
    generateLink.mutate({ data: { productId: id } }, { // Assuming ID correlates or API handles it
      onSuccess: (linkData) => {
        window.open(linkData.url, "_blank");
      }
    });
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "purchase": return "Compra";
      case "credit": return "Crédito (Assinatura)";
      case "rateio": return "Rateio Coletivo";
      default: return source;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meus Downloads</h1>
            <p className="text-muted-foreground mt-1">Acesse todas as multitracks que você possui.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !downloads || downloads.length === 0 ? (
          <div className="text-center py-24 bg-card/30 rounded-2xl border border-dashed border-border">
            <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">Nenhum download disponível</h3>
            <p className="text-muted-foreground mb-6">Você ainda não adquiriu nenhuma multitrack.</p>
            <Link href="/catalog"><Button>Explorar Catálogo</Button></Link>
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
                      <Download className="h-4 w-4 mr-2" /> Baixar Zip
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
                    <span>Adquirido em: {format(new Date(grant.createdAt), "dd/MM/yyyy")}</span>
                    <span className="flex items-center gap-1">
                      <Download className="h-3 w-3" /> {grant.downloadCount}x
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