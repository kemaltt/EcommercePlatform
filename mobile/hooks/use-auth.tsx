import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { User, InsertUser } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: InsertUser) => Promise<void>;
  logout: () => Promise<void>;
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
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/me"], user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      const res = await api.post("/auth/register", data);
      return res.data;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/me"], user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
    },
  });

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
