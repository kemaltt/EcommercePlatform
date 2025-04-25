import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Product } from "@shared/schema";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CartSidebar from "@/components/layout/cart-sidebar";
import StarRating from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, Truck, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetail() {
  const { id } = useParams();
  const productId = parseInt(id);
  const [, navigate] = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  const { user } = useAuth();
  const { addToCart } = useCart();

  // Fetch product details
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch product details");
      }
      return response.json();
    },
  });

  // Fetch favorite status
  const { data: favoriteStatus, isPending: isFavoriteLoading } = useQuery({
    queryKey: ["/api/favorites/check", productId],
    queryFn: async () => {
      if (!user) return { isFavorite: false };
      const res = await fetch(`/api/favorites/check/${productId}`, {
        credentials: "include",
      });
      return res.json();
    },
    enabled: !!user,
  });

  // Toggle favorite mutation
  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "You must be logged in to save favorites",
        variant: "destructive",
      });
      return;
    }

    try {
      const isFavorite = favoriteStatus?.isFavorite;
      
      if (isFavorite) {
        await apiRequest("DELETE", `/api/favorites/${productId}`);
        toast({
          title: "Removed from favorites",
          description: `${product?.name} has been removed from your favorites`,
        });
      } else {
        await apiRequest("POST", "/api/favorites", { productId });
        toast({
          title: "Added to favorites",
          description: `${product?.name} has been added to your favorites`,
        });
      }
      
      // Invalidate queries to refresh data
      await Promise.all([
        fetch(`/api/favorites/check/${productId}`, { credentials: "include" }),
        fetch("/api/favorites", { credentials: "include" }),
      ]);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!product) return;
    
    if (!user) {
      toast({
        title: "Login required",
        description: "You must be logged in to add items to your cart",
        variant: "destructive",
      });
      return;
    }

    addToCart(product, quantity);
    setIsCartOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Button 
              variant="outline" 
              className="mb-6"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to products
            </Button>

            <Card className="bg-white rounded-lg shadow overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                {/* Image skeleton */}
                <div className="flex flex-col space-y-4">
                  <Skeleton className="aspect-square w-full h-auto rounded-lg" />
                  <div className="grid grid-cols-4 gap-2">
                    <Skeleton className="aspect-square w-full h-auto rounded-lg" />
                    <Skeleton className="aspect-square w-full h-auto rounded-lg" />
                    <Skeleton className="aspect-square w-full h-auto rounded-lg" />
                    <Skeleton className="aspect-square w-full h-auto rounded-lg" />
                  </div>
                </div>

                {/* Content skeleton */}
                <div className="flex flex-col">
                  <Skeleton className="h-10 w-3/4 mb-4" />
                  <Skeleton className="h-6 w-1/3 mb-6" />
                  <Skeleton className="h-8 w-1/4 mb-6" />
                  
                  <Skeleton className="h-5 w-1/4 mb-2" />
                  <Skeleton className="h-20 w-full mb-6" />
                  
                  <Skeleton className="h-5 w-1/4 mb-2" />
                  <Skeleton className="h-12 w-full mb-6" />
                  
                  <Skeleton className="h-12 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </Card>
          </div>
        </main>

        <Footer />
        <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Button 
              variant="outline" 
              className="mb-6"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to products
            </Button>

            <Card className="bg-white rounded-lg shadow p-10 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
              <p className="text-gray-600 mb-6">
                Sorry, we couldn't find the product you're looking for.
              </p>
              <Button 
                onClick={() => navigate("/")}
                className="bg-primary text-white hover:bg-primary/90"
              >
                Continue Shopping
              </Button>
            </Card>
          </div>
        </main>

        <Footer />
        <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    );
  }

  const isFavorite = favoriteStatus?.isFavorite || false;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onCartOpen={() => setIsCartOpen(true)} />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button 
            variant="outline" 
            className="mb-6"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to products
          </Button>

          <Card className="bg-white rounded-lg shadow overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
              {/* Product Images */}
              <div className="flex flex-col space-y-4">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={product.imageUrl} 
                    className="w-full h-full object-center object-cover" 
                    alt={product.name} 
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={product.imageUrl} 
                      className="w-full h-full object-center object-cover cursor-pointer" 
                      alt={product.name} 
                    />
                  </div>
                  {/* Placeholder images */}
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-col">
                <h1 className="text-2xl font-extrabold text-gray-900">{product.name}</h1>
                
                <div className="mt-2 flex items-center">
                  <StarRating rating={product.rating || 0} />
                  <span className="ml-1 text-sm text-gray-500">
                    ({product.reviews || 0} ratings)
                  </span>
                </div>

                <div className="mt-4">
                  <h2 className="sr-only">Product information</h2>
                  <p className="text-3xl text-gray-900">${product.price.toFixed(2)}</p>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-900">Description</h3>
                  <div className="mt-2 space-y-6">
                    <p className="text-base text-gray-500">{product.description}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-900">Details</h3>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-gray-500">
                      Category: <span className="text-gray-700 capitalize">{product.category}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Available Stock: <span className="text-gray-700">{product.stock}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Status: <span className={`text-${product.stock > 0 ? 'green' : 'red'}-600`}>
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center">
                    <label htmlFor="quantity" className="mr-2 text-sm font-medium text-gray-700">
                      Quantity
                    </label>
                    <Select
                      value={quantity.toString()}
                      onValueChange={(value) => setQuantity(parseInt(value))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder="1" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(Math.min(10, product.stock))].map((_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <Button
                    className="flex-grow bg-primary text-white hover:bg-primary/90"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to cart'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    className={isFavorite ? "text-primary" : "text-gray-700"}
                    onClick={toggleFavorite}
                    disabled={isFavoriteLoading}
                  >
                    <Heart className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
                  </Button>
                </div>

                <div className="mt-6 border-t border-gray-200 pt-6">
                  <div className="flex items-center">
                    <Truck className="text-green-500 mr-2" size={20} />
                    <p className="text-sm text-gray-500">Free shipping for orders over $100</p>
                  </div>
                  <div className="mt-2 flex items-center">
                    <RefreshCw className="text-green-500 mr-2" size={20} />
                    <p className="text-sm text-gray-500">30-day return policy</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
