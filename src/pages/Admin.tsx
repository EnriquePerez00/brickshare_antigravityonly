import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Users, Boxes } from "lucide-react";
import ProductsManager from "@/components/admin/ProductsManager";
import WishlistsViewer from "@/components/admin/WishlistsViewer";
import InventoryManager from "@/components/admin/InventoryManager";

const Admin = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground mt-2">
            Manage LEGO sets, inventory, and view user wishlists
          </p>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="wishlists" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Wishlists
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Boxes className="h-4 w-4" />
              Inventory
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductsManager />
          </TabsContent>

          <TabsContent value="wishlists">
            <WishlistsViewer />
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
