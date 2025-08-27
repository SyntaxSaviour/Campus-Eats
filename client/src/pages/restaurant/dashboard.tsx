import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Clock, Check, Star, Utensils, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderItem } from "@/components/restaurant/order-item";
import { MenuItemComponent } from "@/components/restaurant/menu-item";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Order, MenuItem } from "@shared/schema";

export default function RestaurantDashboard() {
  const { user, restaurant } = useAuth();
  const { toast } = useToast();

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders/restaurant", restaurant?.id],
    enabled: !!restaurant?.id,
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ["/api/restaurants", restaurant?.id, "menu"],
    enabled: !!restaurant?.id,
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await apiRequest("PUT", `/api/orders/${orderId}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/restaurant", restaurant?.id] });
      toast({
        title: "Order updated",
        description: "Order status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status.",
        variant: "destructive",
      });
    },
  });

  const updateMenuItemMutation = useMutation({
    mutationFn: async ({ itemId, updates }: { itemId: string; updates: Partial<MenuItem> }) => {
      const response = await apiRequest("PUT", `/api/menu-items/${itemId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", restaurant?.id, "menu"] });
      toast({
        title: "Menu item updated",
        description: "Menu item has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update menu item.",
        variant: "destructive",
      });
    },
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await apiRequest("DELETE", `/api/menu-items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", restaurant?.id, "menu"] });
      toast({
        title: "Menu item deleted",
        description: "Menu item has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete menu item.",
        variant: "destructive",
      });
    },
  });

  const activeOrders = orders.filter((order: Order) => 
    ["placed", "preparing"].includes(order.status)
  );
  const completedOrders = orders.filter((order: Order) => 
    order.status === "delivered"
  );
  const todayRevenue = completedOrders.reduce((sum: number, order: Order) => 
    sum + parseFloat(order.totalAmount), 0
  );

  const handleUpdateOrderStatus = (orderId: string, status: string) => {
    updateOrderMutation.mutate({ orderId, status });
  };

  const handleEditMenuItem = (item: MenuItem) => {
    // TODO: Open edit modal
    console.log("Edit menu item:", item);
  };

  const handleDeleteMenuItem = (itemId: string) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      deleteMenuItemMutation.mutate(itemId);
    }
  };

  const handleToggleAvailability = (itemId: string, isAvailable: boolean) => {
    updateMenuItemMutation.mutate({ itemId, updates: { isAvailable } });
  };

  return (
    <main className="pt-16 min-h-screen" data-testid="restaurant-dashboard">
      {/* Header */}
      <div className="bg-secondary text-secondary-foreground py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1" data-testid="dashboard-title">
              {restaurant?.name || user?.name} Dashboard
            </h1>
            <p className="opacity-90">Manage your restaurant efficiently</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="bg-white/20 rounded-lg px-4 py-2" data-testid="today-orders">
              <span className="text-sm opacity-90">Today's Orders</span>
              <div className="font-semibold">{orders.length} orders</div>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2" data-testid="today-revenue">
              <span className="text-sm opacity-90">Revenue</span>
              <div className="font-semibold">₹{todayRevenue}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card data-testid="stat-active-orders">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Active Orders</p>
                  <p className="text-2xl font-bold">{activeOrders.length}</p>
                </div>
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                  <Clock className="text-accent-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-completed-orders">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Completed</p>
                  <p className="text-2xl font-bold">{completedOrders.length}</p>
                </div>
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                  <Check className="text-secondary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-rating">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Rating</p>
                  <p className="text-2xl font-bold">{restaurant?.rating || "4.8"}</p>
                </div>
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <Star className="text-white fill-current" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-menu-items">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Menu Items</p>
                  <p className="text-2xl font-bold">{menuItems.length}</p>
                </div>
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Utensils className="text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="orders" className="w-full" data-testid="dashboard-tabs">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders" data-testid="tab-orders">Active Orders</TabsTrigger>
            <TabsTrigger value="menu" data-testid="tab-menu">Menu Management</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders" className="space-y-4" data-testid="orders-content">
            {activeOrders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No active orders at the moment.</p>
                </CardContent>
              </Card>
            ) : (
              activeOrders.map((order: Order) => (
                <OrderItem
                  key={order.id}
                  order={order}
                  onUpdateStatus={handleUpdateOrderStatus}
                />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="menu" className="space-y-6" data-testid="menu-content">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Menu Items</h2>
              <Button className="bg-primary hover:bg-primary/90" data-testid="button-add-item">
                <Plus className="mr-2 h-4 w-4" />
                Add New Item
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="menu-items-grid">
              {menuItems.map((item: MenuItem) => (
                <MenuItemComponent
                  key={item.id}
                  item={item}
                  onEdit={handleEditMenuItem}
                  onDelete={handleDeleteMenuItem}
                  onToggleAvailability={handleToggleAvailability}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6" data-testid="analytics-content">
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Weekly Sales</h3>
                  <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <div className="text-4xl mb-4">📊</div>
                      <p className="text-muted-foreground">Sales chart would be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Popular Items</h3>
                  <div className="space-y-4">
                    {menuItems.slice(0, 4).map((item: MenuItem, index: number) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <span>{item.name}</span>
                        <span className="font-semibold">{Math.floor(Math.random() * 50) + 10} orders</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
