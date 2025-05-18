import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { FormattedMessage, useIntl } from "react-intl";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const { toast } = useToast();
  const intl = useIntl();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      setIsSubmitting(true);
      await apiRequest("POST", "/api/auth/forgot-password", data);
      
      toast({
        title: intl.formatMessage({ id: "auth.forgotPassword.success.title" }),
        description: intl.formatMessage({ id: "auth.forgotPassword.success.description" }),
      });
      
      form.reset();
    } catch (error: any) {
      toast({
        title: intl.formatMessage({ id: "auth.forgotPassword.error.title" }),
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
            <FormattedMessage id="auth.forgotPassword.title" />
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            <FormattedMessage id="auth.forgotPassword.description" />
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FormattedMessage id="auth.email" />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={intl.formatMessage({ id: "auth.emailPlaceholder" })}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <FormattedMessage id="auth.forgotPassword.submit" />
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
} 