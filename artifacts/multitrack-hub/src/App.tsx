import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/AuthContext";
import NotFound from "@/pages/not-found";

// Pages
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Catalog from "@/pages/catalog";
import ProductDetail from "@/pages/product-detail";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Orders from "@/pages/orders";
import OrderDetail from "@/pages/order-detail";
import Downloads from "@/pages/downloads";
import Plans from "@/pages/plans";
import Subscription from "@/pages/subscription";
import RateiosList from "@/pages/rateios";
import RateioDetail from "@/pages/rateio-detail";
import Wishlist from "@/pages/wishlist";

// Admin Pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminProductNew from "@/pages/admin/products/new";
import AdminProductEdit from "@/pages/admin/products/edit";
import AdminOrders from "@/pages/admin/orders";
import AdminUsers from "@/pages/admin/users";
import AdminUserDetail from "@/pages/admin/users/detail";
import AdminRateios from "@/pages/admin/rateios";
import AdminCoupons from "@/pages/admin/coupons";
import AdminCredits from "@/pages/admin/credits";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/catalog" component={Catalog} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/orders" component={Orders} />
      <Route path="/orders/:id" component={OrderDetail} />
      <Route path="/downloads" component={Downloads} />
      <Route path="/plans" component={Plans} />
      <Route path="/subscription" component={Subscription} />
      <Route path="/rateios" component={RateiosList} />
      <Route path="/rateios/:id" component={RateioDetail} />
      <Route path="/wishlist" component={Wishlist} />
      
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/products/new" component={AdminProductNew} />
      <Route path="/admin/products/:id/edit" component={AdminProductEdit} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/users/:id" component={AdminUserDetail} />
      <Route path="/admin/rateios" component={AdminRateios} />
      <Route path="/admin/coupons" component={AdminCoupons} />
      <Route path="/admin/credits" component={AdminCredits} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
