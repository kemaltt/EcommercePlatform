import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { User, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<RegisterApiResponse, Error, RegisterData>;
  updateProfileMutation: UseMutationResult<User, Error, UpdateProfileData>;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = Omit<InsertUser, "isAdmin">;

type UpdateProfileData = {
  fullName?: string;
  email?: string;
  address?: string;
};

type RegisterApiResponse = {
  message: string;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["profile"],
    queryFn: () => apiRequest("GET", "/api/auth/verify-email").then(res => res.status === 401 ? null : res.json()),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const loginMutation = useMutation<User, Error, LoginData>({
    mutationFn: async (credentials) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Login request failed' }));
        const error = new Error(errorData.message || 'Login failed');
        (error as any).response = { status: res.status, data: errorData };
        throw error;
      }
      return await res.json().then(data => data.user);
    },
    onSuccess: (loggedInUser) => {
      queryClient.setQueryData(["profile"], loggedInUser);
    },
    onError: (error: any) => {
      console.error("Login mutation failed:", error.response?.data?.message || error.message);
    },
  });

  const registerMutation = useMutation<RegisterApiResponse, Error, RegisterData>({
    mutationFn: async (userData) => {
      const res = await apiRequest("POST", "/api/auth/register", userData);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Registration request failed' }));
        const error = new Error(errorData.message || 'Registration failed');
        (error as any).response = { status: res.status, data: errorData };
        throw error;
      }
      return await res.json();
    },
    onSuccess: (data) => {
      console.log("Registration API call successful:", data.message);
    },
    onError: (error: any) => {
      console.error("Register mutation failed:", error.response?.data?.message || error.message);
    },
  });

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["profile"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation<User, Error, UpdateProfileData>({
    mutationFn: async (profileData) => {
      const res = await apiRequest("PUT", "/api/user/profile", profileData);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Profile update request failed' }));
        const error = new Error(errorData.message || 'Profile update failed');
        (error as any).response = { status: res.status, data: errorData };
        throw error;
      }
      return await res.json().then(data => data.user);
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["profile"], updatedUser);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        updateProfileMutation,
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
