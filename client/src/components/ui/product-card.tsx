import { Product } from "@shared/schema";
import { Link } from "wouter";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import StarRating from "@/components/ui/star-rating";
import { useCart } from "@/contexts/cart-context";
import { FormattedMessage, useIntl } from "react-intl";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const queryClient = useQueryClient();
  const intl = useIntl();

  // Check if product is in favorites
  const { data: favoriteStatus, isFetching: isFavoriteLoading } = useQuery({
    queryKey: ["/api/favorites/check", product.id],
    queryFn: async () => {
      if (!user) return { isFavorite: false };
      const res = await fetch(`/api/favorites/check/${product.id}`, {
        credentials: "include",
      });
      return res.json();
    },
    enabled: !!user,
  });

  // Toggle favorite status mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error(intl.formatMessage({ id: "product.loginRequired" }));
      
      const isFavorite = favoriteStatus?.isFavorite;
      
      if (isFavorite) {
        await apiRequest("DELETE", `/api/favorites/${product.id}`);
      } else {
        await apiRequest("POST", "/api/favorites", { productId: product.id });
      }
      
      return !isFavorite;
    },
    onSuccess: (newFavoriteStatus) => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites/check", product.id] });
      
      toast({
        title: intl.formatMessage({ 
          id: newFavoriteStatus ? "product.addedToFavorites" : "product.removedFromFavorites" 
        }),
        description: intl.formatMessage({ 
          id: newFavoriteStatus ? "product.addedToFavoritesDesc" : "product.removedFromFavoritesDesc" 
        }, { name: product.name }),
      });
    },
    onError: (error: Error) => {
      toast({
        title: intl.formatMessage({ id: "product.failedToUpdateFavorites" }),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle add to cart click
  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: intl.formatMessage({ id: "product.loginRequired" }),
        description: intl.formatMessage({ id: "product.loginToAddCart" }),
        variant: "destructive",
      });
      return;
    }

    addToCart(product);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product details
    toggleFavoriteMutation.mutate();
  };

  const isFavorite = favoriteStatus?.isFavorite || false;

  return (
    <Card className="bg-white rounded-lg shadow overflow-hidden flex flex-col h-full">
      <div className="relative">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="h-48 w-full object-cover"
        />
        <button 
          onClick={handleFavoriteToggle}
          disabled={isFavoriteLoading || toggleFavoriteMutation.isPending}
          className={`absolute top-2 right-2 p-1.5 bg-white bg-opacity-70 rounded-full 
            ${isFavorite ? 'text-primary' : 'text-gray-600 hover:text-primary'} transition-colors`}
        >
          <Heart fill={isFavorite ? "currentColor" : "none"} size={18} />
        </button>
      </div>
      
      <CardContent className="p-4 flex-grow">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-lg font-medium text-gray-900 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-gray-500 text-sm">
          {product.description.length > 50 
            ? `${product.description.substring(0, 50)}...` 
            : product.description}
        </p>
        <div className="mt-2 flex items-center">
          <StarRating rating={product.rating || 0} />
          <span className="ml-1 text-sm text-gray-500">
            <FormattedMessage 
              id="product.reviews" 
              values={{ count: product.reviews || 0 }}
            />
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between w-full">
          <p className="text-lg font-medium text-gray-900">
            {intl.formatNumber(product.price, {
              style: 'currency',
              currency: 'EUR'
            })}
          </p>
          <Button 
            onClick={handleAddToCart}
            size="sm"
            className="text-white bg-primary hover:bg-primary/90"
          >
            <FormattedMessage id="product.addToCart" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
