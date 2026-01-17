import React, { createContext, useContext, ReactNode } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Product, CartItem } from "@shared/schema";
import { useAuth } from "./use-auth";
import { Alert } from "react-native";

interface CartContextType {
  cartItems: (CartItem & { product: Product })[];
  subtotal: number;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: cartItems = [], isLoading } = useQuery<(CartItem & { product: Product })[]>({
    queryKey: ["/api/cart"],
    queryFn: async () => {
      if (!user) return [];
      const res = await api.get("/cart");
      return res.data;
    },
    enabled: !!user,
  });

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const addToCartMutation = useMutation({
    mutationFn: async ({ product, quantity }: { product: Product; quantity: number }) => {
      await api.post("/cart", { productId: product.id, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      await api.put(`/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  return (
    <CartContext.Provider
      value={{
        cartItems,
        subtotal,
        addToCart: async (product, quantity = 1) => {
          if (!user) {
            Alert.alert("Login Required", "Please login to add items to cart");
            return;
          }
          await addToCartMutation.mutateAsync({ product, quantity });
        },
        updateQuantity: async (id, quantity) => {
          await updateQuantityMutation.mutateAsync({ id, quantity });
        },
        removeFromCart: async (id) => {
          await removeMutation.mutateAsync(id);
        },
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
