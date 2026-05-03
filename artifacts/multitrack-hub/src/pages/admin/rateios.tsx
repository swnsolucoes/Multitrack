import { useAdminListRateios, useAdminUpdateRateioStatus, getAdminListRateiosQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export default function AdminRateios() {
  const { data, isLoading } = useAdminListRateios();
  const updateStatus = useAdminUpdateRateioStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleStatusChange = (id: number, newStatus: string) => {
    updateStatus.mutate({ rateioId: id, data: { status: newStatus as any } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getAdminListRateiosQueryKey() }); toast({ title: "OK" }); },
      onError: () => { toast({ variant: "destructive", title: t("common.error") }); },
    });
  };

  const statusOptions = [
    { value: "suggested", label: t("rateios.status_suggested") },
    { value: "in_quotation", label: t("rateios.status_in_quotation") },
    { value: "open", label: t("rateios.status_open") },
    { value: "goal_reached", label: t("rateios.status_goal_reached") },
    { value: "in_progress", label: t("rateios.status_in_progress") },
    { value: "completed", label: t("rateios.status_completed") },
    { value: "cancelled", label: t("rateios.status_cancelled") },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("admin.rateios")}</h1>
        </div>

        <div className="border border-border rounded-md bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Song / Artist</TableHead>
                <TableHead>Goal / Participants</TableHead>
                <TableHead>Collected</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </TableCell></TableRow>
              ) : !data || data.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">—</TableCell></TableRow>
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
                        {rateio.targetAmount ? formatCurrency(rateio.targetAmount) : "—"}
                        <div className="text-xs text-muted-foreground">{rateio.minParticipants} min.</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold">{percentComplete}%</div>
                        <div className="text-xs text-muted-foreground">{rateio.currentParticipants} {t("rateios.participants", { n: "" }).trim()}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{rateio.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Select value={rateio.status} onValueChange={(val) => handleStatusChange(rateio.id, val)}>
                          <SelectTrigger className="w-[160px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
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
