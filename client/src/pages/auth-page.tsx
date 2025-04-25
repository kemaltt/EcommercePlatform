import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { insertUserSchema } from "@shared/schema";
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { LanguageSwitcher } from "@/components/ui/language-switcher";

// Form şemalarını ayrı tanımlayalım
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

const registerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  address: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof insertUserSchema>;

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState({
    login: false,
    register: false,
    confirmPassword: false
  });
  const intl = useIntl();

  // Kullanıcı zaten giriş yapmışsa ana sayfaya yönlendir
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      address: "",
    },
    mode: "onSubmit"
  });

  // Form submit handlers
  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync(data);
      toast({
        title: "Success!",
        description: "You have successfully logged in.",
      });
    } catch (error) {
      toast({
        title: "Error!",
        description: "Failed to login. Please check your credentials.",
        variant: "destructive",
      });
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    const validationResult = registerSchema.safeParse(data);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors;
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return;
    }

    try {
      await registerMutation.mutateAsync(data);
      toast({
        title: "Success!",
        description: "Account created successfully. You can now login.",
      });
      setActiveTab("login");
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred during registration.",
        variant: "destructive",
      });
    }
  };

  // Password input component
  const PasswordInput = ({ 
    field, 
    showPassword, 
    onTogglePassword, 
    placeholder,
    isLoading = false 
  }: {
    field: any;
    showPassword: boolean;
    onTogglePassword: () => void;
    placeholder: string;
    isLoading?: boolean;
  }) => (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        {...field}
        disabled={isLoading}
        className="pr-10"
      />
      <button
        type="button"
        onClick={onTogglePassword}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        tabIndex={-1}
      >
        {showPassword ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4" />
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-gray-50">
      {/* Sol kolon */}
      <div className="w-full sm:w-1/2 bg-primary text-white p-12 flex flex-col">
        {/* Orta kısım - Ana içerik */}
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-6">
              <FormattedMessage id="app.welcome" />
            </h1>
            <p className="text-lg mb-8">
              <FormattedMessage id="auth.welcomeDescription" />
            </p>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3">
                <span className="text-primary-foreground">✓</span>
                <span><FormattedMessage id="auth.feature1" /></span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="text-primary-foreground">✓</span>
                <span><FormattedMessage id="auth.feature2" /></span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="text-primary-foreground">✓</span>
                <span><FormattedMessage id="auth.feature3" /></span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="text-primary-foreground">✓</span>
                <span><FormattedMessage id="auth.feature4" /></span>
              </li>
            </ul>
          </div>
        </div>

        {/* Alt kısım - Dil değiştirici */}
        <div className="mt-8">
          <div className="flex items-center justify-start space-x-2 text-sm">
            <span className="opacity-75">
              <FormattedMessage id="language.select" defaultMessage="Dil seçin:" />
            </span>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Sağ kolon */}
      <div className="w-full sm:w-1/2 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              <FormattedMessage id="app.title" />
            </CardTitle>
            <CardDescription className="text-center">
              <FormattedMessage id="auth.subtitle" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">
                  <FormattedMessage id="auth.login" />
                </TabsTrigger>
                <TabsTrigger value="register">
                  <FormattedMessage id="auth.register" />
                </TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <FormattedMessage id="auth.usernameOrEmail" />
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              disabled={loginMutation.isPending}
                              placeholder={intl.formatMessage({ id: "auth.emailPlaceholder" })}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <FormattedMessage id="auth.password" />
                          </FormLabel>
                          <FormControl>
                            <PasswordInput
                              field={field}
                              showPassword={showPassword.login}
                              onTogglePassword={() => setShowPassword(prev => ({ ...prev, login: !prev.login }))}
                              isLoading={loginMutation.isPending}
                              placeholder={intl.formatMessage({ id: "auth.passwordPlaceholder" })}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center justify-between">
                      <FormField
                        control={loginForm.control}
                        name="rememberMe"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange}
                                disabled={loginMutation.isPending}
                              />
                            </FormControl>
                            <Label className="text-sm">
                              <FormattedMessage id="auth.rememberMe" />
                            </Label>
                          </FormItem>
                        )}
                      />

                      <Button variant="link" className="px-0" asChild>
                        <a href="#" className="text-sm">
                          <FormattedMessage id="auth.forgotPassword" />
                        </a>
                      </Button>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <FormattedMessage id="auth.signingIn" />
                        </>
                      ) : (
                        <FormattedMessage id="auth.signIn" />
                      )}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                      <FormattedMessage id="auth.noAccount" />{' '}
                      <Button 
                        variant="link" 
                        className="px-0"
                        onClick={() => setActiveTab("register")}
                      >
                        <FormattedMessage id="auth.registerNow" />
                      </Button>
                    </p>
                  </form>
                </Form>
              </TabsContent>

              {/* Register Form */}
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <FormattedMessage id="auth.fullName" />
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              disabled={registerMutation.isPending}
                              placeholder={intl.formatMessage({ id: "auth.fullNamePlaceholder" })}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Username <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="johndoe" 
                              {...field} 
                              disabled={registerMutation.isPending}
                              className={`${
                                registerForm.formState.errors.username ? "border-red-500 focus-visible:ring-red-500" : ""
                              }`}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <FormattedMessage id="auth.email" />
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="email"
                              disabled={registerMutation.isPending}
                              placeholder={intl.formatMessage({ id: "auth.emailPlaceholder" })}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Password <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className={`relative ${
                              registerForm.formState.errors.password ? "border-red-500 focus-within:ring-red-500" : ""
                            }`}>
                              <PasswordInput
                                field={field}
                                showPassword={showPassword.register}
                                onTogglePassword={() => setShowPassword(prev => ({ ...prev, register: !prev.register }))}
                                isLoading={registerMutation.isPending}
                                placeholder={intl.formatMessage({ id: "auth.passwordPlaceholder" })}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Confirm Password <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className={`relative ${
                              registerForm.formState.errors.confirmPassword ? "border-red-500 focus-within:ring-red-500" : ""
                            }`}>
                              <PasswordInput
                                field={field}
                                showPassword={showPassword.confirmPassword}
                                onTogglePassword={() => setShowPassword(prev => ({ 
                                  ...prev, 
                                  confirmPassword: !prev.confirmPassword 
                                }))}
                                isLoading={registerMutation.isPending}
                                placeholder={intl.formatMessage({ id: "auth.passwordPlaceholder" })}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your address (optional)" 
                              {...field} 
                              disabled={registerMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <FormattedMessage id="auth.creatingAccount" />
                        </>
                      ) : (
                        <FormattedMessage id="auth.createAccount" />
                      )}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                      <FormattedMessage id="auth.haveAccount" />{' '}
                      <Button 
                        variant="link" 
                        className="px-0"
                        onClick={() => setActiveTab("login")}
                      >
                        <FormattedMessage id="auth.signInNow" />
                      </Button>
                    </p>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}