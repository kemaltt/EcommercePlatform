import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CartSidebar from "@/components/layout/cart-sidebar";
import ProductCard from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { FormattedMessage } from 'react-intl';

export default function FavoritesPage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [, navigate] = useLocation();

  // Fetch favorites
  const { data: favorites, isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/favorites"],
    queryFn: async () => {
      const res = await fetch("/api/favorites", {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch favorites");
      }
      return res.json();
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onCartOpen={() => setIsCartOpen(true)} />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            <FormattedMessage id="favorites.title" />
          </h1>
          
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-red-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                <FormattedMessage id="favorites.error.title" />
              </h3>
              <p className="text-gray-500 mb-4">
                <FormattedMessage id="favorites.error.description" />
              </p>
              <Button 
                onClick={() => navigate("/")}
                className="bg-primary text-white hover:bg-primary/90"
              >
                <FormattedMessage id="favorites.browseProducts" />
              </Button>
            </div>
          ) : !favorites || favorites.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-4xl text-gray-300 mb-4">
                <Heart size={64} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                <FormattedMessage id="favorites.empty.title" />
              </h3>
              <p className="text-gray-500 mb-4">
                <FormattedMessage id="favorites.empty.description" />
              </p>
              <Button 
                onClick={() => navigate("/")}
                className="bg-primary text-white hover:bg-primary/90"
              >
                <FormattedMessage id="favorites.browseProducts" />
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
