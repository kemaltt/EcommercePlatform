import { createContext, useContext, ReactNode, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { User, InsertUser } from "@shared/schema";
import { registerForPushNotificationsAsync } from "../lib/notifications";
import * as Notifications from "expo-notifications";
import { useRouter, router } from "expo-router";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: InsertUser) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  verifyResetCode: (token: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  appleLogin: (data: {
    identityToken: string;
    fullName?: { firstName?: string; lastName?: string } | null;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        const res = await api.get("/auth/me");
        return res.data;
      } catch (e) {
        return null;
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post("/auth/login", data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      const res = await api.post("/auth/register", data);
      return res.data;
    },
    onSuccess: (data) => {
      // Register doesn't return user, but if it did, we'd handle it here
      // For now, it just returns a message, so we don't set user
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.setQueryData(["/api/cart"], []);
      queryClient.setQueryData(["/favorites"], []);
      // Optional: Invalidate to ensure fresh fetch on next login, though setQueryData handles the UI reset
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/favorites"] });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      await api.post("/auth/forgot-password", { email });
    },
  });

  const verifyResetCodeMutation = useMutation({
    mutationFn: async (token: string) => {
      const res = await api.post("/auth/verify-reset-token", { token });
      return res.data;
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({
      token,
      password,
    }: {
      token: string;
      password: string;
    }) => {
      await api.post("/auth/reset-password", { token, password });
    },
  });

  const googleLoginMutation = useMutation({
    mutationFn: async (idToken: string) => {
      const res = await api.post("/auth/google", { idToken });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data.user);
    },
  });

  const appleLoginMutation = useMutation({
    mutationFn: async (data: {
      identityToken: string;
      fullName?: { firstName?: string; lastName?: string } | null;
    }) => {
      const res = await api.post("/auth/apple", data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data.user);
    },
  });

  const updatePushTokenMutation = useMutation({
    mutationFn: async (token: string) => {
      await api.post("/notifications/register", { token });
    },
  });

  useEffect(() => {
    if (user) {
      console.log(
        "[Push] User logged in, attempting to register for push notifications...",
      );
      registerForPushNotificationsAsync()
        .then((token) => {
          if (token) {
            console.log("[Push] Token received:", token);
            updatePushTokenMutation.mutate(token, {
              onSuccess: () =>
                console.log("[Push] Token registered successfully"),
              onError: (error) =>
                console.error("[Push] Token registration failed:", error),
            });
          } else {
            console.log(
              "[Push] No token received - check permissions or device type",
            );
          }
        })
        .catch((error) => {
          console.error("[Push] Error getting token:", error);
        });

      // Handle notifications when the app is in foreground
      const notificationListener =
        Notifications.addNotificationReceivedListener((notification) => {
          // You could show a custom in-app banner here or just invalidate the query
          queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
        });

      // Handle notification clicks (app in background or killed)
      const responseListener =
        Notifications.addNotificationResponseReceivedListener((response) => {
          const data = response.notification.request.content.data;
          // Example: Navigate to specific screen based on notification data
          if (data.screen) {
            router.push(data.screen as any);
          } else {
            router.push("/notifications");
          }
        });

      return () => {
        notificationListener.remove();
        responseListener.remove();
      };
    }
  }, [user?.id]);

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        login: async (data) => {
          await loginMutation.mutateAsync(data);
        },
        register: async (data) => {
          await registerMutation.mutateAsync(data);
        },
        logout: async () => {
          await logoutMutation.mutateAsync();
        },
        forgotPassword: async (email) => {
          await forgotPasswordMutation.mutateAsync(email);
        },
        verifyResetCode: async (token) => {
          await verifyResetCodeMutation.mutateAsync(token);
        },
        resetPassword: async (token, password) => {
          await resetPasswordMutation.mutateAsync({ token, password });
        },
        googleLogin: async (idToken: string) => {
          await googleLoginMutation.mutateAsync(idToken);
        },
        appleLogin: async (data) => {
          await appleLoginMutation.mutateAsync(data);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
