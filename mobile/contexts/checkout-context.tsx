import React, { createContext, useContext, useState, ReactNode } from "react";
import { Address, InsertOrderItem } from "@shared/schema";

interface CheckoutState {
  shippingAddress: Address | null;
  shippingMethod: {
    id: string;
    name: string;
    price: number;
    days: string;
  } | null;
  paymentMethod: {
    type: "credit_card" | "paypal" | "klarna" | "debit_card";
    last4?: string;
    expiry?: string;
  } | null;
  items: InsertOrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  pointsUsed: number;
  total: number;
}

interface CheckoutContextType {
  state: CheckoutState;
  setShippingAddress: (address: Address) => void;
  setShippingMethod: (method: CheckoutState["shippingMethod"]) => void;
  setPaymentMethod: (method: CheckoutState["paymentMethod"]) => void;
  setItems: (items: InsertOrderItem[]) => void;
  setPointsUsed: (points: number) => void;
  resetCheckout: () => void;
}

const initialState: CheckoutState = {
  shippingAddress: null,
  shippingMethod: {
    id: "standard",
    name: "Standard Delivery",
    price: 0,
    days: "3-5 business days",
  },
  paymentMethod: null,
  items: [],
  subtotal: 0,
  shippingCost: 0,
  tax: 0,
  pointsUsed: 0,
  total: 0,
};

const CheckoutContext = createContext<CheckoutContextType | null>(null);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CheckoutState>(initialState);

  const setShippingAddress = (address: Address) => {
    setState((prev) => ({ ...prev, shippingAddress: address }));
  };

  const setShippingMethod = (method: CheckoutState["shippingMethod"]) => {
    setState((prev) => ({
      ...prev,
      shippingMethod: method,
      shippingCost: method?.price || 0,
      total:
        prev.subtotal +
        (method?.price || 0) +
        prev.tax -
        (prev.pointsUsed || 0),
    }));
  };

  const setPaymentMethod = (method: CheckoutState["paymentMethod"]) => {
    setState((prev) => ({ ...prev, paymentMethod: method }));
  };

  const setItems = (items: InsertOrderItem[]) => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    setState((prev) => ({
      ...prev,
      items,
      subtotal,
      total: subtotal + prev.shippingCost + prev.tax - (prev.pointsUsed || 0),
    }));
  };

  const setPointsUsed = (points: number) => {
    setState((prev) => ({
      ...prev,
      pointsUsed: points,
      total: prev.subtotal + prev.shippingCost + prev.tax - points,
    }));
  };

  const resetCheckout = () => {
    setState(initialState);
  };

  return (
    <CheckoutContext.Provider
      value={{
        state,
        setShippingAddress,
        setShippingMethod,
        setPaymentMethod,
        setItems,
        setPointsUsed,
        resetCheckout,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
}
