import { useState } from "react";
import { Link } from "wouter";
import { useAdminListProducts, useAdminDeleteProduct, getAdminListProductsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

export default function AdminProducts() {
  const [q, setQ] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  const { data, isLoading } = useAdminListProducts({ q });
  const deleteProduct = useAdminDeleteProduct();

  const handleDelete = (id: number) => {
    if (confirm(t("common.confirm"))) {
      deleteProduct.mutate({ productId: id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
          toast({ title: t("common.delete") });
        },
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("admin.products")}</h1>
          </div>
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4 mr-2" /> {t("common.create")}
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder={t("catalog.search_placeholder")} className="pl-8 bg-card"
              value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        <div className="border border-border rounded-md bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.products")}</TableHead>
                <TableHead>{t("checkout.total")}</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead className="text-right">{t("common.edit")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </TableCell></TableRow>
              ) : data?.products.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">—</TableCell></TableRow>
              ) : (
                data?.products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-secondary overflow-hidden shrink-0">
                          {product.coverUrl ? <img src={product.coverUrl} alt={product.name} className="w-full h-full object-cover" /> : null}
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground">{product.artist}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.promoPrice ? (
                        <div>
                          <span className="font-medium text-primary">{formatCurrency(product.promoPrice)}</span>
                          <span className="text-xs text-muted-foreground line-through block">{formatCurrency(product.price)}</span>
                        </div>
                      ) : (
                        <span className="font-medium">{formatCurrency(product.price)}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        product.status === "active" ? "text-green-500 border-green-500/50" :
                        product.status === "draft" ? "text-amber-500 border-amber-500/50" :
                        "text-muted-foreground"
                      }>
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{product.totalSales}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Pencil className="mr-2 h-4 w-4" /> {t("common.edit")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(product.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> {t("common.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
