import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import App from "./App";
import "./index.css";
import { AuthProvider } from "@/hooks/use-auth";
import { CartProvider } from "@/contexts/cart-context";
import { queryClient } from "@/lib/queryClient";
import { LanguageProvider } from "@/contexts/language-context";




createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
    <AuthProvider>
      <CartProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <App />
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);
