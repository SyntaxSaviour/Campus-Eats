import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, ShoppingCart, MapPin, Clock, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RestaurantCard } from "@/components/student/restaurant-card";
import { CartSidebar } from "@/components/student/cart-sidebar";
import { FilterDialog } from "@/components/student/filter-dialog";
import { useAuth } from "@/hooks/use-auth";
import type { Restaurant } from "@shared/schema";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("all");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    dietary: [],
    priceRange: [0, 1000],
    rating: 0,
    deliveryTime: 60,
  });

  const { data: restaurants = [] } = useQuery({
    queryKey: ["/api/restaurants"],
  });

  const filteredRestaurants = restaurants.filter((restaurant: Restaurant) => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = selectedCuisine === "all" || restaurant.cuisine === selectedCuisine;
    const matchesRating = parseFloat(restaurant.rating || "0") >= filters.rating;
    const matchesPrice = restaurant.priceForTwo >= filters.priceRange[0] && 
                        restaurant.priceForTwo <= filters.priceRange[1];
    
    return matchesSearch && matchesCuisine && matchesRating && matchesPrice;
  });

  const cuisineTypes = [...new Set(restaurants.map((r: Restaurant) => r.cuisine))];

  const addToCart = (item: any, restaurant: Restaurant) => {
    const cartItem = {
      id: `${item.id}-${Date.now()}`,
      menuItemId: item.id,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      name: item.name,
      price: item.price,
      quantity: 1,
      imageUrl: item.imageUrl,
    };
    setCartItems(prev => [...prev, cartItem]);
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems(prev => 
      prev.map(item => 
        item.id === cartItemId ? { ...item, quantity } : item
      )
    );
  };

  const cartTotal = cartItems.reduce((total, item) => 
    total + (parseFloat(item.price) * item.quantity), 0
  );

  const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <main className="pt-16 min-h-screen bg-background" data-testid="student-dashboard">
      {/* Header Section */}
      <div className="bg-primary text-primary-foreground py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2" data-testid="welcome-message">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-primary-foreground/80">
                Order delicious food from campus restaurants
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <div className="bg-white/20 rounded-lg px-4 py-2 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="text-sm">Campus Delivery</span>
              </div>
              <Button
                variant="secondary"
                onClick={() => setIsCartOpen(true)}
                className="relative"
                data-testid="cart-button"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart ({cartItemCount})
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search restaurants or cuisines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                data-testid="search-input"
              />
            </div>
            <Select value={selectedCuisine} onValueChange={setSelectedCuisine} data-testid="cuisine-filter">
              <SelectTrigger className="w-full md:w-48 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="All Cuisines" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cuisines</SelectItem>
                {cuisineTypes.map(cuisine => (
                  <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              onClick={() => setIsFilterOpen(true)}
              data-testid="filter-button"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{filteredRestaurants.length}</div>
              <div className="text-sm text-muted-foreground">Available Restaurants</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">15-45</div>
              <div className="text-sm text-muted-foreground">Delivery Time (min)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">Free</div>
              <div className="text-sm text-muted-foreground">Campus Delivery</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">4.5+</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Filters Display */}
        {(filters.dietary.length > 0 || filters.rating > 0 || selectedCuisine !== "all") && (
          <div className="mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">Active filters:</span>
              {selectedCuisine !== "all" && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedCuisine("all")}>
                  {selectedCuisine} ✕
                </Badge>
              )}
              {filters.dietary.map((diet: string) => (
                <Badge key={diet} variant="secondary">
                  {diet} ✕
                </Badge>
              ))}
              {filters.rating > 0 && (
                <Badge variant="secondary">
                  {filters.rating}+ ⭐ ✕
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Restaurants Grid */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {filteredRestaurants.length} Restaurant{filteredRestaurants.length !== 1 ? 's' : ''} Available
            </h2>
          </div>

          {filteredRestaurants.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium mb-2">No restaurants found</h3>
                  <p>Try adjusting your search or filters to find more options.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="restaurants-grid">
              {filteredRestaurants.map((restaurant: Restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onAddToCart={addToCart}
                  dietaryFilters={filters.dietary}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        total={cartTotal}
      />

      {/* Filter Dialog */}
      <FilterDialog
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </main>
  );
}