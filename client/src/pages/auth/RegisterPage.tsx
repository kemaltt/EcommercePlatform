import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { AuthPasswordInput } from "./AuthPasswordInput";
import { registerSchema, type RegisterFormValues, type RegisterPayload } from "./authSchemas";

interface RegisterPageProps {
  onRegisterSuccess?: () => void; // Kayıt sonrası login tab'ına geçmek için
}

export function RegisterPage({ onRegisterSuccess }: RegisterPageProps) {
  const { registerMutation } = useAuth();
  const { toast } = useToast();
  const intl = useIntl();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      address: "",
    },
    mode: "onSubmit" // Hataları submit anında göster
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      // confirmPassword alanını backend'e gönderme
      const payload: RegisterPayload = {
        fullName: data.fullName,
        username: data.username,
        email: data.email,
        password: data.password,
        address: data.address,
      };
      const response = await registerMutation.mutateAsync(payload);
      toast({
        title: intl.formatMessage({ id: "toast.register.success.title" }),
        description: response?.message || intl.formatMessage({ id: "toast.register.success.defaultDescription" }),
      });
      form.reset();
      if (onRegisterSuccess) {
        onRegisterSuccess(); // Login tab'ına geç
      }
    } catch (error: any) {
      toast({
        title: intl.formatMessage({ id: "toast.register.error.title" }),
        description: error?.response?.data?.message || error?.message || intl.formatMessage({ id: "toast.register.error.defaultDescription" }),
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4"> {/* space-y-6'dan 4'e düşürüldü, daha kompakt */}
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel><FormattedMessage id="auth.fullName" /></FormLabel>
              <FormControl>
                <Input
                  placeholder={intl.formatMessage({ id: 'auth.fullNamePlaceholder' })}
                  {...field}
                  disabled={registerMutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel><FormattedMessage id="auth.username" /></FormLabel>
              <FormControl>
                <Input
                  placeholder={intl.formatMessage({ id: 'auth.fullNamePlaceholder' })}
                  {...field}
                  disabled={registerMutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel><FormattedMessage id="auth.email" /></FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={intl.formatMessage({ id: 'auth.emailPlaceholder' })}
                  {...field}
                  disabled={registerMutation.isPending}
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
                  isLoading={registerMutation.isPending}
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
              <FormLabel><FormattedMessage id="auth.confirm.password" /></FormLabel>
              <FormControl>
                <AuthPasswordInput
                  field={field}
                  showPassword={showConfirmPassword}
                  onTogglePassword={() => setShowConfirmPassword((prev) => !prev)}
                  placeholder={intl.formatMessage({ id: 'auth.passwordPlaceholder' })}
                  isLoading={registerMutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <FormattedMessage id="auth.address" />{" "}
                <span className="text-xs text-muted-foreground">
                  (<FormattedMessage id="global.optional" />)
                </span>
              </FormLabel>
              <FormControl>
                <Input
                  // placeholder={intl.formatMessage({ id: 'auth.addressPlaceholder' })}
                  {...field}
                  disabled={registerMutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
          {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <FormattedMessage id="auth.createAccount" />
        </Button>
      </form>
    </Form>
  );
} 