import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { AuthPasswordInput } from "./AuthPasswordInput";
import { loginSchema, type LoginFormValues } from "./authSchemas";
// import { useLocation } from "wouter"; // Eğer başarılı login sonrası yönlendirme burada yapılacaksa

export function LoginPage() {
  // const [location, navigate] = useLocation(); // Yönlendirme için
  const { loginMutation } = useAuth();
  const { toast } = useToast();
  const intl = useIntl();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync(data);
      toast({
        title: intl.formatMessage({ id: "toast.login.success.title" }),
        description: intl.formatMessage({ id: "toast.login.success.description" }),
      });
      // Başarılı giriş sonrası yönlendirme useAuth hook'u içinde veya burada yapılabilir.
      // Örneğin: navigate("/");
    } catch (error: any) {
      toast({
        title: intl.formatMessage({ id: "toast.login.error.title" }),
        description: error?.response?.data?.message || error?.message || intl.formatMessage({ id: "toast.login.error.defaultDescription" }),
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel><FormattedMessage id="auth.usernameOrEmail" /></FormLabel>
              <FormControl>
                <Input
                  placeholder={intl.formatMessage({ id: 'auth.emailPlaceholder' })}
                  {...field}
                  disabled={loginMutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel><FormattedMessage id="auth.password" /></FormLabel>
              <FormControl>
                <AuthPasswordInput
                  field={field}
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword((prev) => !prev)}
                  placeholder={intl.formatMessage({ id: 'auth.passwordPlaceholder' })}
                  isLoading={loginMutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={loginMutation.isPending}
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  <FormattedMessage id="auth.rememberMe" />
                </FormLabel>
              </FormItem>
            )}
          />
          <Button type="button" variant="link" className="px-0 text-sm">
            <FormattedMessage id="auth.forgotPassword" />
          </Button>
        </div>
        <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
          {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <FormattedMessage id="auth.login" />
        </Button>
      </form>
    </Form>
  );
} 