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
import { useTranslation } from "react-i18next";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const loginMutation = useLogin();

  const loginSchema = z.object({
    email: z.string().email({ message: t("auth.email") }),
    password: z.string().min(1, { message: t("auth.password") }),
  });

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: z.infer<typeof loginSchema>) {
    loginMutation.mutate({ data: values }, {
      onSuccess: (data) => {
        login(data.token);
        toast({ title: t("auth.login_title"), description: `${data.user.name}` });
        setLocation("/");
      },
      onError: () => {
        toast({ variant: "destructive", title: t("common.error"), description: "Invalid credentials. Please try again." });
      },
    });
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-background">
      <div className="hidden md:flex flex-col justify-between p-12 bg-card relative overflow-hidden border-r border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <Link href="/" className="relative z-10 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit">
          <ArrowLeft className="h-4 w-4" /> {t("auth.back_to_site")}
        </Link>
        <div className="relative z-10 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-8 text-primary">
            <Music className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">{t("auth.login_heading")}</h1>
          <p className="text-lg text-muted-foreground">{t("auth.login_desc")}</p>
        </div>
        <div className="relative z-10 text-sm text-muted-foreground">&copy; {new Date().getFullYear()} MultiTrack Hub</div>
      </div>

      <div className="flex flex-col justify-center p-8 sm:p-12 md:p-24 relative">
        <div className="md:hidden mb-8">
          <Link href="/" className="font-bold text-2xl tracking-tighter text-primary">MULTITRACK<span className="text-foreground">HUB</span></Link>
        </div>
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight mb-2">{t("auth.login_title")}</h2>
            <p className="text-muted-foreground">{t("auth.login_subtitle")}</p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.email")}</FormLabel>
                  <FormControl><Input placeholder="seu@email.com" type="email" className="h-12 bg-secondary/50" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>{t("auth.password")}</FormLabel>
                    <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">{t("auth.forgot_password")}</Link>
                  </div>
                  <FormControl><Input placeholder="••••••••" type="password" className="h-12 bg-secondary/50" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full h-12 text-base font-bold" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{t("auth.logging_in")}</> : t("auth.login_btn")}
              </Button>
            </form>
          </Form>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            {t("auth.no_account")}{" "}
            <Link href="/register" className="font-bold text-primary hover:underline">{t("auth.create_free")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
