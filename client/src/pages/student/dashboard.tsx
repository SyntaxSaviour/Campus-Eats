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
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-16">
        <div className="absolute inset-0 opacity-40">
          <div className="w-full h-full bg-orange-100 bg-opacity-20"></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-orange-600 mb-4">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Campus Delivery Available
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gradient mb-4" data-testid="welcome-message">
              Hey {user?.name?.split(' ')[0] || 'Student'}! 
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Hungry? Let's get you some <span className="text-gradient font-semibold">delicious campus food</span> delivered right to your dorm!
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <div className="glass rounded-full px-6 py-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium">Free Campus Delivery</span>
              </div>
              <Button
                onClick={() => setIsCartOpen(true)}
                className="relative bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-none px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                data-testid="cart-button"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                View Cart ({cartItemCount})
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-orange-600 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 max-w-4xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search restaurants, cuisines, or dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg border-2 border-orange-200 rounded-2xl bg-white/90 backdrop-blur-sm focus:border-orange-400 focus:bg-white shadow-lg"
                data-testid="search-input"
              />
            </div>
            <Select value={selectedCuisine} onValueChange={setSelectedCuisine} data-testid="cuisine-filter">
              <SelectTrigger className="lg:w-48 py-4 border-2 border-orange-200 rounded-2xl bg-white/90 backdrop-blur-sm text-gray-700">
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
              onClick={() => setIsFilterOpen(true)}
              className="py-4 px-6 rounded-2xl bg-white/90 backdrop-blur-sm border-2 border-orange-200 text-gray-700 hover:bg-white hover:border-orange-400 transition-all duration-300"
              variant="outline"
              data-testid="filter-button"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="glass rounded-2xl p-6 text-center hover:shadow-glow transition-all duration-300">
            <div className="text-3xl font-bold text-gradient">{filteredRestaurants.length}</div>
            <div className="text-gray-600 font-medium mt-1">Restaurants</div>
          </div>
          <div className="glass rounded-2xl p-6 text-center hover:shadow-glow-green transition-all duration-300">
            <div className="text-3xl font-bold text-gradient-green">15-45</div>
            <div className="text-gray-600 font-medium mt-1">Min Delivery</div>
          </div>
          <div className="glass rounded-2xl p-6 text-center hover:shadow-glow transition-all duration-300">
            <div className="text-3xl font-bold text-gradient">Free</div>
            <div className="text-gray-600 font-medium mt-1">Campus Delivery</div>
          </div>
          <div className="glass rounded-2xl p-6 text-center hover:shadow-glow transition-all duration-300">
            <div className="text-3xl font-bold text-gradient">4.5★</div>
            <div className="text-gray-600 font-medium mt-1">Avg Rating</div>
          </div>
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