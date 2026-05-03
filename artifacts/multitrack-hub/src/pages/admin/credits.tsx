import { useAdminAdjustCredits } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

const adjustSchema = z.object({
  userId: z.coerce.number().min(1),
  amount: z.coerce.number(),
  description: z.string().min(3),
});

export default function AdminCredits() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const adjustCredits = useAdminAdjustCredits();

  const form = useForm<z.infer<typeof adjustSchema>>({
    resolver: zodResolver(adjustSchema),
    defaultValues: { userId: 0, amount: 0, description: "Manual adjustment" },
  });

  const onSubmit = (values: z.infer<typeof adjustSchema>) => {
    adjustCredits.mutate({ data: values }, {
      onSuccess: () => { toast({ title: t("admin.credits") }); form.reset(); },
      onError: () => { toast({ variant: "destructive", title: t("common.error") }); },
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("admin.credits")}</h1>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="userId" render={({ field }) => (
                <FormItem>
                  <FormLabel>User ID</FormLabel>
                  <FormControl><Input type="number" {...field} value={field.value || ""} placeholder="1" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (+ to add, - to remove)</FormLabel>
                  <FormControl><Input type="number" {...field} value={field.value || ""} placeholder="5 or -2" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" disabled={adjustCredits.isPending} className="w-full">
                {adjustCredits.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                {t("common.confirm")}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </AdminLayout>
  );
}
