import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RestaurantCard } from "@/components/student/restaurant-card";
import { OrderCard } from "@/components/student/order-card";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useAuth } from "@/hooks/use-auth";
import type { Restaurant, Order } from "@shared/schema";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState("");
  const [sortBy, setSortBy] = useState("");

  const { data: restaurants = [], isLoading: restaurantsLoading } = useQuery({
    queryKey: ["/api/restaurants"],
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders/student", user?.id],
    enabled: !!user?.id,
  });

  const activeOrder = orders.find((order: Order) => 
    ["placed", "preparing", "ready"].includes(order.status)
  );

  const activeRestaurant = restaurants.find((r: Restaurant) => 
    r.id === activeOrder?.restaurantId
  );

  const filteredRestaurants = restaurants.filter((restaurant: Restaurant) => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = !cuisineFilter || restaurant.cuisine === cuisineFilter;
    return matchesSearch && matchesCuisine;
  });

  const handleRestaurantClick = (restaurant: Restaurant) => {
    // TODO: Navigate to restaurant menu page
    console.log("Show menu for:", restaurant.name);
  };

  return (
    <main className="pt-16 min-h-screen mobile-nav-padding" data-testid="student-dashboard">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1" data-testid="welcome-message">
              Welcome back, {user?.name}!
            </h1>
            <p className="opacity-90">Ready to order some delicious food?</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            {activeOrder && (
              <div className="bg-white/20 rounded-lg px-4 py-2" data-testid="current-order-status">
                <span className="text-sm opacity-90">Current Order</span>
                <div className="font-semibold">
                  {activeRestaurant?.name} - {activeOrder.status}
                </div>
              </div>
            )}
            <button className="bg-white/20 rounded-lg p-2 hover:bg-white/30 transition-colors" data-testid="notifications-button">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              className="pl-10"
              placeholder="Search restaurants or food items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="search-input"
            />
          </div>
          <div className="flex gap-2">
            <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
              <SelectTrigger className="w-[180px]" data-testid="cuisine-filter">
                <SelectValue placeholder="All Cuisines" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Cuisines</SelectItem>
                <SelectItem value="Indian">Indian</SelectItem>
                <SelectItem value="Chinese">Chinese</SelectItem>
                <SelectItem value="Italian">Italian</SelectItem>
                <SelectItem value="Fast Food">Fast Food</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]" data-testid="sort-filter">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Default</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="delivery">Delivery Time</SelectItem>
                <SelectItem value="price">Price</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Order Card */}
        {activeOrder && activeRestaurant && (
          <div className="mb-8">
            <OrderCard 
              order={activeOrder} 
              restaurantName={activeRestaurant.name}
            />
          </div>
        )}

        {/* Restaurant Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6" data-testid="restaurants-title">
            Popular Restaurants
          </h2>
          
          {restaurantsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl border border-border h-80 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="restaurants-grid">
              {filteredRestaurants.map((restaurant: Restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onClick={() => handleRestaurantClick(restaurant)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </main>
  );
}
