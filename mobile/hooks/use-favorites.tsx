
import React, { createContext, useContext, ReactNode } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Favorite, Product } from "@shared/schema";
import { useAuth } from "./use-auth";
import { Alert } from "react-native";

interface FavoritesContextType {
  favorites: Product[];
  toggleFavorite: (product: Product) => Promise<void>;
  isFavorite: (productId: number) => boolean;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/favorites"],
    queryFn: async () => {
      if (!user) return [];
      const res = await api.get("/favorites"); // Ensure endpoint matches server route
      return res.data;
    },
    enabled: !!user,
  });

  const addFavoriteMutation = useMutation({
    mutationFn: async (productId: number) => {
      await api.post("/favorites", { productId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/favorites"] });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (productId: number) => {
      await api.delete(`/favorites/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/favorites"] });
    },
  });

  const isFavorite = (productId: number) => {
    return favorites.some((fav) => fav.id === productId);
  };

  const toggleFavorite = async (product: Product) => {
    if (!user) {
      Alert.alert("Login Required", "Please login to save favorites");
      return;
    }

    if (isFavorite(product.id)) {
      await removeFavoriteMutation.mutateAsync(product.id);
    } else {
      await addFavoriteMutation.mutateAsync(product.id);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        isLoading,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
