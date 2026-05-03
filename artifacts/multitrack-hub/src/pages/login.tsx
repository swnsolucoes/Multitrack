import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Music, Loader2, ArrowLeft } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(1, { message: "A senha é obrigatória" }),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const loginMutation = useLogin();
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof loginSchema>) {
    loginMutation.mutate({ data: values }, {
      onSuccess: (data) => {
        login(data.token);
        toast({
          title: "Login realizado com sucesso",
          description: `Bem-vindo de volta, ${data.user.name}!`,
        });
        setLocation("/");
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Erro ao fazer login",
          description: error?.response?.data?.error || "Credenciais inválidas. Tente novamente.",
        });
      }
    });
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-background">
      {/* Visual Side */}
      <div className="hidden md:flex flex-col justify-between p-12 bg-card relative overflow-hidden border-r border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
        
        <Link href="/" className="relative z-10 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit">
          <ArrowLeft className="h-4 w-4" /> Voltar para o site
        </Link>
        
        <div className="relative z-10 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-8 text-primary backdrop-blur-sm">
            <Music className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-foreground">
            Acesso ao Estúdio
          </h1>
          <p className="text-lg text-muted-foreground">
            Entre para baixar suas multitracks, acessar suas compras e gerenciar sua assinatura.
          </p>
        </div>
        
        <div className="relative z-10 text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} MultiTrack Hub
        </div>
      </div>
      
      {/* Form Side */}
      <div className="flex flex-col justify-center p-8 sm:p-12 md:p-24 relative">
        <div className="md:hidden mb-8">
          <Link href="/" className="font-bold text-2xl tracking-tighter text-primary">
            MULTITRACK<span className="text-foreground">HUB</span>
          </Link>
        </div>
        
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight mb-2 text-foreground">Entrar</h2>
            <p className="text-muted-foreground">Digite seu email e senha para acessar sua conta.</p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <div className="flex items-center justify-between">
                      <FormLabel>Senha</FormLabel>
                      <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                        Esqueceu a senha?
                      </Link>
                    </div>
                    <FormControl>
                      <Input placeholder="••••••••" type="password" className="h-12 bg-secondary/50 border-border" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full h-12 text-base font-bold" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Entrando...</>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          </Form>
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link href="/register" className="font-bold text-primary hover:underline">
              Crie uma grátis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}