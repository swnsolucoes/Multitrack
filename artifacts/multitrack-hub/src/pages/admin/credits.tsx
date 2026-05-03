import { useState } from "react";
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

const adjustSchema = z.object({
  userId: z.coerce.number().min(1, "ID do usuário é obrigatório"),
  amount: z.coerce.number(),
  description: z.string().min(3, "Descrição é obrigatória"),
});

export default function AdminCredits() {
  const { toast } = useToast();
  const adjustCredits = useAdminAdjustCredits();

  const form = useForm<z.infer<typeof adjustSchema>>({
    resolver: zodResolver(adjustSchema),
    defaultValues: {
      userId: 0,
      amount: 0,
      description: "Ajuste manual administrativo",
    }
  });

  const onSubmit = (values: z.infer<typeof adjustSchema>) => {
    adjustCredits.mutate(
      { data: values },
      {
        onSuccess: () => {
          toast({ title: "Créditos ajustados com sucesso!" });
          form.reset();
        },
        onError: () => {
          toast({ variant: "destructive", title: "Erro ao ajustar créditos" });
        }
      }
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Créditos</h1>
          <p className="text-muted-foreground">Adicione ou remova créditos de um usuário manualmente.</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="userId" render={({ field }) => (
                <FormItem>
                  <FormLabel>ID do Usuário</FormLabel>
                  <FormControl><Input type="number" {...field} value={field.value || ''} placeholder="Ex: 1" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade (+ para adicionar, - para remover)</FormLabel>
                  <FormControl><Input type="number" {...field} value={field.value || ''} placeholder="Ex: 5 ou -2" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo do Ajuste</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button type="submit" disabled={adjustCredits.isPending} className="w-full">
                {adjustCredits.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                Confirmar Ajuste
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </AdminLayout>
  );
}