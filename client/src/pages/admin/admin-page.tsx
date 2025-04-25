import { useState } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CartSidebar from "@/components/layout/cart-sidebar";
import ProductManagement from "@/pages/admin/product-management";
import UserManagement from "@/pages/admin/user-management";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function AdminPage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("products");
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // If user is not an admin, redirect
  if (user && !user.isAdmin) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onCartOpen={() => setIsCartOpen(true)} />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-white shadow overflow-hidden sm:rounded-lg">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b border-gray-200">
                <TabsList className="flex -mb-px">
                  <TabsTrigger 
                    value="products" 
                    className="py-4 px-6 text-center border-b-2 font-medium text-sm"
                  >
                    Products
                  </TabsTrigger>
                  <TabsTrigger 
                    value="orders" 
                    className="py-4 px-6 text-center border-b-2 font-medium text-sm"
                  >
                    Orders
                  </TabsTrigger>
                  <TabsTrigger 
                    value="users" 
                    className="py-4 px-6 text-center border-b-2 font-medium text-sm"
                  >
                    Users
                  </TabsTrigger>
                  <TabsTrigger 
                    value="stats" 
                    className="py-4 px-6 text-center border-b-2 font-medium text-sm"
                  >
                    Statistics
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="products">
                <ProductManagement />
              </TabsContent>
              
              <TabsContent value="orders">
                <div className="p-6 text-center">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Order Management</h2>
                  <p className="text-gray-500">Order management functionality would be implemented here.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="users">
                <UserManagement />
              </TabsContent>
              
              <TabsContent value="stats">
                <div className="p-6 text-center">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Statistics</h2>
                  <p className="text-gray-500">Statistics dashboard would be implemented here.</p>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </main>

      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
