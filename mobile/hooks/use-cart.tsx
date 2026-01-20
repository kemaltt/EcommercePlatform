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
  clearCart: () => Promise<void>;
  isLoading: boolean;
  couponCode: string | null;
  discountAmount: number;
  total: number;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: cartItems = [], isLoading } = useQuery<
    (CartItem & { product: Product })[]
  >({
    queryKey: ["/api/cart"],
    queryFn: async () => {
      if (!user) return [];
      const res = await api.get("/cart");
      return res.data;
    },
    enabled: !!user,
  });

  const [couponCode, setCouponCode] = React.useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = React.useState(0);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  const total = Math.max(0, subtotal - discountAmount);

  // Reset coupon if cart is empty
  React.useEffect(() => {
    if (cartItems.length === 0) {
      setCouponCode(null);
      setDiscountAmount(0);
    }
  }, [cartItems]);

  // Re-validate coupon if subtotal changes (to ensure minPurchase etc) - simplified: just remove if invalid?
  // For now, simpler approach: if subtotal changes, we might want to re-validate, but let's keep it simple.
  // Actually, let's reset discount if subtotal drops below coupon logic?
  // We'll trust the user to re-apply or validate on checkout.
  // Better: Re-run validation effect if couponCode exists.
  React.useEffect(() => {
    if (couponCode) {
      validateCoupon(couponCode);
    }
  }, [subtotal]);

  const validateCoupon = async (code: string) => {
    try {
      const res = await api.post("/cart/validate-coupon", {
        code,
        cartTotal: subtotal,
      });
      if (res.data.valid) {
        setDiscountAmount(res.data.discountAmount);
      } else {
        setCouponCode(null);
        setDiscountAmount(0);
      }
    } catch (e) {
      // If validation fails (e.g. min purchase requirement no longer met), remove coupon
      setCouponCode(null);
      setDiscountAmount(0);
    }
  };

  const applyCoupon = async (code: string) => {
    try {
      const res = await api.post("/cart/validate-coupon", {
        code,
        cartTotal: subtotal,
      });
      setCouponCode(code);
      setDiscountAmount(res.data.discountAmount);
      Alert.alert(
        "Success",
        `Coupon ${code} applied! Saved $${res.data.discountAmount}`,
      );
    } catch (error: any) {
      const msg = error.response?.data?.message || "Invalid coupon";
      Alert.alert("Error", msg);
      throw error;
    }
  };

  const removeCoupon = () => {
    setCouponCode(null);
    setDiscountAmount(0);
  };

  const addToCartMutation = useMutation({
    mutationFn: async ({
      product,
      quantity,
    }: {
      product: Product;
      quantity: number;
    }) => {
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

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await api.delete("/cart");
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
        clearCart: async () => {
          await clearCartMutation.mutateAsync();
        },
        isLoading,
        couponCode,
        discountAmount,
        total,
        applyCoupon,
        removeCoupon,
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
