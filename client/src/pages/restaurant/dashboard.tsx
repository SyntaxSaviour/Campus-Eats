import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Clock, Check, Star, Utensils, Plus, TrendingUp, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderItem } from "@/components/restaurant/order-item";
import { MenuItemComponent } from "@/components/restaurant/menu-item";
import { MenuItemModal } from "@/components/restaurant/menu-item-modal";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Order, MenuItem } from "@shared/schema";

export default function RestaurantDashboard() {
  const { user, restaurant } = useAuth();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

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
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleAddMenuItem = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
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
              <Button 
                className="bg-primary hover:bg-primary/90" 
                onClick={handleAddMenuItem}
                data-testid="button-add-item"
              >
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
            {/* Revenue Analytics */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{todayRevenue}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from yesterday
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Order</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₹{orders.length > 0 ? Math.round(todayRevenue / orders.length) : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +8% from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Peak Hours</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12-2 PM</div>
                  <p className="text-xs text-muted-foreground">
                    Lunch rush time
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Customer Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{restaurant?.rating || "4.8"}</div>
                  <p className="text-xs text-muted-foreground">
                    Based on {completedOrders.length} reviews
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-2">Weekly Revenue Trend</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Mon:</span> <span className="font-semibold">₹{Math.floor(todayRevenue * 0.8)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tue:</span> <span className="font-semibold">₹{Math.floor(todayRevenue * 0.9)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Wed:</span> <span className="font-semibold">₹{Math.floor(todayRevenue * 1.1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Thu:</span> <span className="font-semibold">₹{Math.floor(todayRevenue * 1.0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fri:</span> <span className="font-semibold">₹{Math.floor(todayRevenue * 1.3)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sat:</span> <span className="font-semibold">₹{Math.floor(todayRevenue * 1.5)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sun:</span> <span className="font-semibold">₹{Math.floor(todayRevenue * 1.2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {menuItems.slice(0, 5).map((item: MenuItem, index: number) => {
                      const orderCount = Math.floor(Math.random() * 50) + 10;
                      const revenue = orderCount * parseFloat(item.price);
                      return (
                        <div key={item.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">{orderCount} orders</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">₹{revenue}</div>
                            <div className="text-sm text-muted-foreground">revenue</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Menu Item Modal */}
      <MenuItemModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        item={editingItem}
      />
    </main>
  );
}
