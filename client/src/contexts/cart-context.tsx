import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface CartContextProps {
  cartItems: (CartItem & { product: Product })[];
  subtotal: number;
  addToCart: (product: Product, quantity?: number) => void;
  updateCartItemQuantity: (id: number, quantity: number) => void;
  removeCartItem: (id: number) => void;
  clearCart: () => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch cart items
  const { data: cartItems = [], isLoading, refetch } = useQuery<(CartItem & { product: Product })[]>({
    queryKey: ['/api/cart'],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch('/api/cart', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch cart items');
      return res.json();
    },
    enabled: !!user,
  });

  // Calculate subtotal
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Add product to cart
  const addToCart = async (product: Product, quantity = 1) => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'You must be logged in to add items to your cart',
        variant: 'destructive',
      });
      return;
    }

    try {
      await apiRequest('POST', '/api/cart', {
        productId: product.id,
        quantity,
      });
      
      // Refetch cart data
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      
      toast({
        title: 'Added to cart',
        description: `${product.name} has been added to your cart`,
      });
    } catch (error) {
      toast({
        title: 'Failed to add to cart',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  // Update cart item quantity
  const updateCartItemQuantity = async (id: number, quantity: number) => {
    try {
      await apiRequest('PUT', `/api/cart/${id}`, { quantity });
      
      // Refetch cart data
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    } catch (error) {
      toast({
        title: 'Failed to update cart',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  // Remove item from cart
  const removeCartItem = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/cart/${id}`);
      
      // Refetch cart data
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      
      toast({
        title: 'Removed from cart',
        description: 'Item has been removed from your cart',
      });
    } catch (error) {
      toast({
        title: 'Failed to remove item',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  // Clear entire cart (not currently exposed in API, but could be implemented)
  const clearCart = async () => {
    try {
      // Implementation would depend on backend API
      // For now, remove each item individually
      for (const item of cartItems) {
        await apiRequest('DELETE', `/api/cart/${item.id}`);
      }
      
      // Refetch cart data
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      
      toast({
        title: 'Cart cleared',
        description: 'All items have been removed from your cart',
      });
    } catch (error) {
      toast({
        title: 'Failed to clear cart',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        subtotal,
        addToCart,
        updateCartItemQuantity,
        removeCartItem,
        clearCart,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
