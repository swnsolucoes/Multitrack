import { useState } from "react";
import { useAdminListRateios, useAdminUpdateRateioStatus, getAdminListRateiosQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminRateios() {
  const { data, isLoading } = useAdminListRateios();
  const updateStatus = useAdminUpdateRateioStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleStatusChange = (id: number, newStatus: string) => {
    updateStatus.mutate(
      { rateioId: id, data: { status: newStatus as any } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListRateiosQueryKey() });
          toast({ title: "Status atualizado com sucesso" });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Erro ao atualizar status" });
        }
      }
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rateios Coletivos</h1>
          <p className="text-muted-foreground">Gerencie as campanhas de rateio.</p>
        </div>

        <div className="border border-border rounded-md bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Música / Artista</TableHead>
                <TableHead>Meta / Cotas</TableHead>
                <TableHead>Arrecadado</TableHead>
                <TableHead>Status Atual</TableHead>
                <TableHead>Ação Rápida</TableHead>
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
                    Nenhum rateio encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((rateio) => {
                  const percentComplete = Math.min(100, Math.round((rateio.currentParticipants / (rateio.minParticipants || 1)) * 100));
                  
                  return (
                    <TableRow key={rateio.id}>
                      <TableCell>
                        <div className="font-medium">{rateio.songName}</div>
                        <div className="text-xs text-muted-foreground">{rateio.artist}</div>
                      </TableCell>
                      <TableCell>
                        {rateio.targetAmount ? formatCurrency(rateio.targetAmount) : '-'}
                        <div className="text-xs text-muted-foreground">{rateio.minParticipants} cotas min.</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold">{percentComplete}%</div>
                        <div className="text-xs text-muted-foreground">{rateio.currentParticipants} participantes</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{rateio.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={rateio.status} 
                          onValueChange={(val) => handleStatusChange(rateio.id, val)}
                        >
                          <SelectTrigger className="w-[180px] h-8 text-xs">
                            <SelectValue placeholder="Alterar status..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="suggested">Sugerido</SelectItem>
                            <SelectItem value="in_quotation">Em Cotação</SelectItem>
                            <SelectItem value="open">Aberto</SelectItem>
                            <SelectItem value="goal_reached">Meta Atingida</SelectItem>
                            <SelectItem value="in_progress">Em Produção</SelectItem>
                            <SelectItem value="completed">Concluído</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}