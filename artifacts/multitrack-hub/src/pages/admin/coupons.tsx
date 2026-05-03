import { useState } from "react";
import { useAdminListCoupons, useAdminCreateCoupon, getAdminListCouponsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Ticket } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const couponSchema = z.object({
  code: z.string().min(3, "Código obrigatório"),
  type: z.enum(["percentage", "fixed"]),
  value: z.coerce.number().min(0.1, "Valor inválido"),
  maxUsesTotal: z.coerce.number().optional().nullable(),
  isActive: z.boolean().default(true),
});

export default function AdminCoupons() {
  const { data, isLoading } = useAdminListCoupons();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createCoupon = useAdminCreateCoupon();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof couponSchema>>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
      type: "percentage",
      value: 10,
      maxUsesTotal: null,
      isActive: true,
    }
  });

  const onSubmit = (values: z.infer<typeof couponSchema>) => {
    createCoupon.mutate(
      { data: values as any },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListCouponsQueryKey() });
          toast({ title: "Cupom criado com sucesso" });
          setOpen(false);
          form.reset();
        },
        onError: () => {
          toast({ variant: "destructive", title: "Erro ao criar cupom" });
        }
      }
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cupons de Desconto</h1>
            <p className="text-muted-foreground">Gerencie os cupons da plataforma.</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Novo Cupom</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Criar Novo Cupom</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="code" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código</FormLabel>
                      <FormControl><Input placeholder="EX: BLACKFRIDAY20" {...field} className="uppercase" onChange={e => field.onChange(e.target.value.toUpperCase())} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="type" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                            <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="value" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  
                  <FormField control={form.control} name="maxUsesTotal" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limite de Usos (Opcional)</FormLabel>
                      <FormControl><Input type="number" {...field} value={field.value || ''} placeholder="Ex: 100" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <Button type="submit" className="w-full" disabled={createCoupon.isPending}>
                    {createCoupon.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Ticket className="h-4 w-4 mr-2" />}
                    Criar Cupom
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border border-border rounded-md bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Usos</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : !data || data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    Nenhum cupom encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-bold font-mono text-primary">{coupon.code}</TableCell>
                    <TableCell>
                      {coupon.type === 'percentage' ? `${coupon.value}%` : formatCurrency(coupon.value)}
                    </TableCell>
                    <TableCell>
                      {coupon.usedCount} {coupon.maxUsesTotal ? `/ ${coupon.maxUsesTotal}` : ''}
                    </TableCell>
                    <TableCell>
                      {coupon.expiresAt ? format(new Date(coupon.expiresAt), "dd/MM/yyyy") : 'Sem validade'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={coupon.isActive ? "text-green-500 border-green-500/50" : "text-muted-foreground"}>
                        {coupon.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}