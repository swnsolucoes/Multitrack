import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Music, Loader2, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const registerMutation = useRegister();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  function onSubmit(values: z.infer<typeof registerSchema>) {
    const { confirmPassword, ...data } = values;
    registerMutation.mutate({ data }, {
      onSuccess: (res) => {
        login(res.token);
        toast({ title: t("auth.register_title"), description: res.user.name });
        setLocation("/");
      },
      onError: () => {
        toast({ variant: "destructive", title: t("common.error"), description: "Error creating account. Try again." });
      },
    });
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-background">
      <div className="hidden md:flex flex-col justify-between p-12 bg-card relative overflow-hidden border-r border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <Link href="/" className="relative z-10 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit">
          <ArrowLeft className="h-4 w-4" /> {t("auth.back_to_site")}
        </Link>
        <div className="relative z-10 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-8 text-primary">
            <Music className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">{t("auth.register_heading")}</h1>
          <p className="text-lg text-muted-foreground mb-6">{t("auth.register_desc")}</p>
          <ul className="space-y-4 text-muted-foreground">
            {["✓ Full catalog in high quality", "✓ Subscription plans with discount", "✓ Lifetime downloads of your purchases"].map(item => (
              <li key={item} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">✓</div>
                {item.replace("✓ ", "")}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative z-10 text-sm text-muted-foreground">&copy; {new Date().getFullYear()} MultiTrack Hub</div>
      </div>

      <div className="flex flex-col justify-center p-8 sm:p-12 md:p-16 lg:p-24 overflow-y-auto">
        <div className="md:hidden mb-8">
          <Link href="/" className="font-bold text-2xl tracking-tighter text-primary">MULTITRACK<span className="text-foreground">HUB</span></Link>
        </div>
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight mb-2">{t("auth.register_title")}</h2>
            <p className="text-muted-foreground">{t("auth.register_subtitle")}</p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.name")}</FormLabel>
                  <FormControl><Input placeholder="João Silva" className="h-12 bg-secondary/50" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.email")}</FormLabel>
                  <FormControl><Input placeholder="seu@email.com" type="email" className="h-12 bg-secondary/50" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.password")}</FormLabel>
                  <FormControl><Input placeholder="Min. 8 characters" type="password" className="h-12 bg-secondary/50" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm {t("auth.password")}</FormLabel>
                  <FormControl><Input placeholder="Repeat your password" type="password" className="h-12 bg-secondary/50" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full h-12 text-base font-bold mt-4" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{t("auth.registering")}</> : t("auth.register_btn")}
              </Button>
            </form>
          </Form>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            {t("auth.has_account")}{" "}
            <Link href="/login" className="font-bold text-primary hover:underline">{t("auth.login_link")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
