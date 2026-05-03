import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/">
              <div className="font-bold text-xl tracking-tighter cursor-pointer text-primary mb-4">
                MULTITRACK<span className="text-foreground">HUB</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              A plataforma definitiva para músicos, bandas e produtores encontrarem multitracks de alta qualidade com o melhor custo-benefício do Brasil.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-foreground mb-4">Navegação</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/catalog" className="hover:text-primary transition-colors">Catálogo Completo</Link></li>
              <li><Link href="/plans" className="hover:text-primary transition-colors">Planos de Assinatura</Link></li>
              <li><Link href="/rateios" className="hover:text-primary transition-colors">Rateios Coletivos</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-foreground mb-4">Minha Conta</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/orders" className="hover:text-primary transition-colors">Minhas Compras</Link></li>
              <li><Link href="/downloads" className="hover:text-primary transition-colors">Meus Downloads</Link></li>
              <li><Link href="/subscription" className="hover:text-primary transition-colors">Minha Assinatura</Link></li>
              <li><Link href="/wishlist" className="hover:text-primary transition-colors">Lista de Desejos</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-foreground mb-4">Suporte</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Política de Privacidade</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} MultiTrack Hub. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            {/* Social icons would go here */}
          </div>
        </div>
      </div>
    </footer>
  );
}
