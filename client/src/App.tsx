import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth/auth-page";
import { ForgotPasswordPage } from "@/pages/auth/forgot-password";
import { ResetPasswordPage } from "@/pages/auth/reset-password";
import { ProtectedRoute, AdminRoute } from "@/lib/protected-route";
import { queryClient } from "./lib/queryClient";
import ProductDetail from "@/pages/product-detail";
import FavoritesPage from "@/pages/favorites-page";
import ProfilePage from "@/pages/profile-page";
import AdminPage from "@/pages/admin/admin-page";
import CheckoutPage from "@/pages/checkout-page";
import EmailVerificationPage from "./pages/email-verification-page";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/email-verified" component={EmailVerificationPage} /> 
      <Route path="/" component={HomePage} />
      <ProtectedRoute path="/favorites" component={FavoritesPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/checkout" component={CheckoutPage} />
      <AdminRoute path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
