import { useEffect } from "react";
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
import { useTranslation } from "react-i18next";

const productSchema = z.object({
  name: z.string().min(1),
  artist: z.string().min(1),
  genre: z.string().min(1),
  description: z.string().min(1),
  price: z.coerce.number().min(0),
  promoPrice: z.coerce.number().optional().nullable(),
  bpm: z.coerce.number().optional().nullable(),
  tonality: z.string().optional(),
  duration: z.string().optional(),
  coverUrl: z.string().url().optional().or(z.literal("")),
  previewAudioUrl: z.string().url().optional().or(z.literal("")),
  videoUrl: z.string().url().optional().or(z.literal("")),
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
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useGetProduct(productId, { query: { enabled: !!productId } });
  const updateProduct = useAdminUpdateProduct();

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", artist: "", genre: "", description: "",
      price: 0, promoPrice: null, bpm: null, tonality: "", duration: "",
      coverUrl: "", previewAudioUrl: "", videoUrl: "",
      quality: "premium", status: "draft",
      isFeatured: false, availableForSale: true, availableForSubscription: true, creditsRequired: 1,
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        artist: product.artist,
        genre: product.genre,
        description: (product as any).description || "",
        price: product.price,
        promoPrice: product.promoPrice ?? null,
        bpm: product.bpm ?? null,
        tonality: product.tonality || "",
        duration: product.duration || "",
        coverUrl: product.coverUrl || "",
        previewAudioUrl: (product as any).previewAudioUrl || "",
        videoUrl: (product as any).videoUrl || "",
        quality: product.quality as any,
        status: product.status as any,
        isFeatured: product.isFeatured,
        availableForSale: true,
        availableForSubscription: product.availableForSubscription,
        creditsRequired: product.creditsRequired,
      });
    }
  }, [product]);

  const onSubmit = (values: z.infer<typeof productSchema>) => {
    updateProduct.mutate({ productId, data: values as any }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetProductQueryKey(productId) });
        toast({ title: t("common.save") });
        setLocation("/admin/products");
      },
      onError: () => { toast({ variant: "destructive", title: t("common.error") }); },
    });
  };

  if (isLoading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </AdminLayout>
  );

  if (!product) return <AdminLayout><div>{t("common.not_found_title")}</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("common.edit")} — {product.name}</h1>
            <p className="text-muted-foreground">{product.artist}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Song Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="artist" render={({ field }) => (
                  <FormItem><FormLabel>Artist</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <FormField control={form.control} name="genre" render={({ field }) => (
                  <FormItem><FormLabel>Genre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="bpm" render={({ field }) => (
                  <FormItem><FormLabel>BPM</FormLabel><FormControl><Input type="number" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="tonality" render={({ field }) => (
                  <FormItem><FormLabel>{t("product.key")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem><FormLabel>Price (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="promoPrice" render={({ field }) => (
                  <FormItem><FormLabel>Promo Price (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="quality" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quality</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">{t("subscription.status_active")}</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="featured">Featured</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="coverUrl" render={({ field }) => (
                  <FormItem><FormLabel>Cover URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="previewAudioUrl" render={({ field }) => (
                  <FormItem><FormLabel>Preview Audio URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <FormField control={form.control} name="videoUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <span className="text-red-500">▶</span> YouTube Video URL (optional)
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="https://www.youtube.com/watch?v=..." {...field} />
                  </FormControl>
                  <p className="text-[11px] text-muted-foreground">
                    Supports youtube.com/watch?v=... · youtu.be/... · youtube.com/shorts/...
                  </p>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="bg-secondary/30 p-4 rounded-xl space-y-4">
                <h3 className="font-bold mb-2">Settings</h3>
                <FormField control={form.control} name="isFeatured" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Featured</FormLabel>
                      <p className="text-[10px] text-muted-foreground">Show in homepage featured section</p>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="availableForSubscription" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Available via Subscription</FormLabel>
                      <p className="text-[10px] text-muted-foreground">Can be downloaded with credits</p>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
                {form.watch("availableForSubscription") && (
                  <FormField control={form.control} name="creditsRequired" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credits Required</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={updateProduct.isPending}>
                  {updateProduct.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("common.save")}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </AdminLayout>
  );
}
