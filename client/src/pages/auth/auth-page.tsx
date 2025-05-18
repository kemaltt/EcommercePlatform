import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormattedMessage } from 'react-intl';
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { LoginPage } from "./LoginPage";
import { RegisterPage } from "./RegisterPage";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-gray-50">
      {/* Sol kolon */}
      <div className="w-full sm:w-1/2 bg-primary text-white p-12 flex flex-col">
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

              <TabsContent value="login">
                <LoginPage />
              </TabsContent>

              <TabsContent value="register">
                <RegisterPage onRegisterSuccess={() => setActiveTab("login")} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}