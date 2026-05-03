import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Music, Loader2, ArrowLeft } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter no mínimo 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(8, { message: "A senha deve ter no mínimo 8 caracteres" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const registerMutation = useRegister();
  
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: z.infer<typeof registerSchema>) {
    const { confirmPassword, ...registerData } = values;
    
    registerMutation.mutate({ data: registerData }, {
      onSuccess: (data) => {
        login(data.token);
        toast({
          title: "Conta criada com sucesso!",
          description: `Bem-vindo ao MultiTrack Hub, ${data.user.name}.`,
        });
        setLocation("/");
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Erro ao criar conta",
          description: error?.response?.data?.error || "Ocorreu um erro. Tente novamente.",
        });
      }
    });
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-background">
      {/* Visual Side */}
      <div className="hidden md:flex flex-col justify-between p-12 bg-card relative overflow-hidden border-r border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
        
        <Link href="/" className="relative z-10 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit">
          <ArrowLeft className="h-4 w-4" /> Voltar para o site
        </Link>
        
        <div className="relative z-10 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-8 text-primary backdrop-blur-sm">
            <Music className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-foreground">
            Junte-se à comunidade
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Crie sua conta para acessar milhares de multitracks premium, participar de rateios coletivos e elevar o nível da sua música.
          </p>
          
          <ul className="space-y-4 text-muted-foreground">
            <li className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">✓</div>
              Catálogo completo em alta qualidade
            </li>
            <li className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">✓</div>
              Planos de assinatura com desconto
            </li>
            <li className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">✓</div>
              Downloads vitalícios das suas compras
            </li>
          </ul>
        </div>
        
        <div className="relative z-10 text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} MultiTrack Hub
        </div>
      </div>
      
      {/* Form Side */}
      <div className="flex flex-col justify-center p-8 sm:p-12 md:p-16 lg:p-24 relative overflow-y-auto">
        <div className="md:hidden mb-8">
          <Link href="/" className="font-bold text-2xl tracking-tighter text-primary">
            MULTITRACK<span className="text-foreground">HUB</span>
          </Link>
        </div>
        
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight mb-2 text-foreground">Criar Conta</h2>
            <p className="text-muted-foreground">Preencha os dados abaixo para começar.</p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="João Silva" className="h-12 bg-secondary/50 border-border" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="seu@email.com" type="email" className="h-12 bg-secondary/50 border-border" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input placeholder="Mínimo 8 caracteres" type="password" className="h-12 bg-secondary/50 border-border" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha</FormLabel>
                    <FormControl>
                      <Input placeholder="Repita sua senha" type="password" className="h-12 bg-secondary/50 border-border" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full h-12 text-base font-bold mt-6" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Criando conta...</>
                ) : (
                  "Criar Conta"
                )}
              </Button>
            </form>
          </Form>
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link href="/login" className="font-bold text-primary hover:underline">
              Fazer login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}