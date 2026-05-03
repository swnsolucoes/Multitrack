import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useAdminUpdateProduct, useGetProduct, getAdminListProductsQueryKey, getGetProductQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ArrowLeft } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  artist: z.string().min(1, "Artista é obrigatório"),
  genre: z.string().min(1, "Gênero é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  price: z.coerce.number().min(0, "Preço deve ser maior ou igual a zero"),
  promoPrice: z.coerce.number().optional().nullable(),
  bpm: z.coerce.number().optional().nullable(),
  tonality: z.string().optional(),
  duration: z.string().optional(),
  coverUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  previewAudioUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  quality: z.enum(["premium", "standard", "backing_track", "demo"]),
  status: z.enum(["active", "inactive", "draft", "featured"]),
  isFeatured: z.boolean().default(false),
  availableForSale: z.boolean().default(true),
  availableForSubscription: z.boolean().default(true),
  creditsRequired: z.coerce.number().default(1),
});

export default function AdminProductEdit() {
  const { id } = useParams();
  const productId = parseInt(id || "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: product, isLoading } = useGetProduct(productId, {
    query: { enabled: !!productId }
  });
  
  const updateProduct = useAdminUpdateProduct();

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      artist: "",
      genre: "",
      description: "",
      price: 0,
      promoPrice: null,
      bpm: null,
      tonality: "",
      duration: "",
      coverUrl: "",
      previewAudioUrl: "",
      quality: "premium",
      status: "draft",
      isFeatured: false,
      availableForSale: true,
      availableForSubscription: true,
      creditsRequired: 1,
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        artist: product.artist,
        genre: product.genre,
        description: product.description || "",
        price: product.price,
        promoPrice: product.promoPrice,
        bpm: product.bpm,
        tonality: product.tonality || "",
        duration: product.duration || "",
        coverUrl: product.coverUrl || "",
        previewAudioUrl: product.previewAudioUrl || "",
        quality: product.quality,
        status: product.status,
        isFeatured: product.isFeatured,
        availableForSale: true, // Assuming available if active? Product schema says it
        availableForSubscription: product.availableForSubscription,
        creditsRequired: product.creditsRequired,
      });
    }
  }, [product, form]);

  const onSubmit = (values: z.infer<typeof productSchema>) => {
    updateProduct.mutate(
      { productId, data: values as any },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetProductQueryKey(productId) });
          toast({ title: "Produto atualizado com sucesso" });
          setLocation("/admin/products");
        },
        onError: () => {
          toast({ variant: "destructive", title: "Erro ao atualizar produto" });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!product) {
    return (
      <AdminLayout>
        <div>Produto não encontrado.</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Produto</h1>
            <p className="text-muted-foreground">{product.name}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Música</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="artist" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Artista</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <FormField control={form.control} name="genre" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gênero</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="bpm" render={({ field }) => (
                  <FormItem>
                    <FormLabel>BPM</FormLabel>
                    <FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="tonality" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tom</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl><Textarea className="min-h-[100px]" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (R$)</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="promoPrice" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Promocional (R$)</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="quality" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qualidade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="backing_track">Backing Track</SelectItem>
                        <SelectItem value="demo">Demo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Rascunho</SelectItem>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                        <SelectItem value="featured">Destaque</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="coverUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Capa</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="previewAudioUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL do Áudio Preview</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="bg-secondary/30 p-4 rounded-xl space-y-4">
                <h3 className="font-bold mb-2">Configurações Adicionais</h3>
                
                <FormField control={form.control} name="isFeatured" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Destaque</FormLabel>
                      <p className="text-[10px] text-muted-foreground">Exibir na seção de destaques da home</p>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />

                <FormField control={form.control} name="availableForSubscription" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Disponível na Assinatura</FormLabel>
                      <p className="text-[10px] text-muted-foreground">Pode ser baixado com créditos</p>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
                
                {form.watch("availableForSubscription") && (
                  <FormField control={form.control} name="creditsRequired" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Créditos Necessários</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={updateProduct.isPending}>
                  {updateProduct.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </AdminLayout>
  );
}