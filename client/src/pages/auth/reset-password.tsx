import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, useNavigate } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { FormattedMessage, useIntl } from "react-intl";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { AuthPasswordInput } from "./AuthPasswordInput";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const { toast } = useToast();
  const intl = useIntl();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    
    if (!tokenParam) {
      toast({
        title: intl.formatMessage({ id: "auth.resetPassword.error.title" }),
        description: intl.formatMessage({ id: "auth.resetPassword.error.invalidToken" }),
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setToken(tokenParam);
  }, [toast, intl, navigate]);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) return;

    try {
      setIsSubmitting(true);
      await apiRequest("POST", "/api/auth/reset-password", {
        token,
        password: data.password,
      });
      
      toast({
        title: intl.formatMessage({ id: "auth.resetPassword.success.title" }),
        description: intl.formatMessage({ id: "auth.resetPassword.success.description" }),
      });
      
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: intl.formatMessage({ id: "auth.resetPassword.error.title" }),
        description: error?.response?.data?.message || error?.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            <FormattedMessage id="auth.resetPassword.title" />
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            <FormattedMessage id="auth.resetPassword.description" />
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FormattedMessage id="auth.password" />
                  </FormLabel>
                  <FormControl>
                    <AuthPasswordInput
                      field={field}
                      showPassword={showPassword}
                      onTogglePassword={() => setShowPassword((prev) => !prev)}
                      placeholder={intl.formatMessage({ id: "auth.passwordPlaceholder" })}
                      isLoading={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FormattedMessage id="auth.confirm.password" />
                  </FormLabel>
                  <FormControl>
                    <AuthPasswordInput
                      field={field}
                      showPassword={showConfirmPassword}
                      onTogglePassword={() => setShowConfirmPassword((prev) => !prev)}
                      placeholder={intl.formatMessage({ id: "auth.passwordPlaceholder" })}
                      isLoading={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <FormattedMessage id="auth.resetPassword.submit" />
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
} 