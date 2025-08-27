import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Plus, Star, Clock, Utensils, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenuItemCard } from "./menu-item-card";
import type { Restaurant, MenuItem } from "@shared/schema";

interface RestaurantModalProps {
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItem, restaurant: Restaurant) => void;
  dietaryFilters: string[];
}

export function RestaurantModal({ 
  restaurant, 
  isOpen, 
  onClose, 
  onAddToCart, 
  dietaryFilters 
}: RestaurantModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: menuItems = [] } = useQuery({
    queryKey: ["/api/restaurants", restaurant.id, "menu"],
    enabled: isOpen,
  });

  if (!isOpen) return null;

  const availableItems = menuItems.filter((item: MenuItem) => item.isAvailable);
  
  const filteredItems = availableItems.filter((item: MenuItem) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesDietary = dietaryFilters.length === 0 || 
      (item.dietaryTags && dietaryFilters.every(filter => item.dietaryTags.includes(filter)));
    
    return matchesSearch && matchesCategory && matchesDietary;
  });

  const categories = ["all", ...new Set(availableItems.map((item: MenuItem) => item.category))];
  const popularItems = availableItems.filter((item: MenuItem) => item.isPopular);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" data-testid="restaurant-modal">
      <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h2 className="text-2xl font-bold" data-testid="modal-restaurant-name">
                  {restaurant.name}
                </h2>
                <div className="flex items-center text-sm">
                  <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                  <span>{restaurant.rating || "4.5"}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Badge variant="outline">{restaurant.cuisine}</Badge>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {restaurant.deliveryTime}
                </div>
                <span>₹{restaurant.priceForTwo} for two</span>
              </div>
              {restaurant.description && (
                <p className="text-sm text-muted-foreground mt-2">{restaurant.description}</p>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="close-modal">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="p-4 border-b bg-muted/30">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="menu-search-input"
              />
            </div>
            <div className="flex gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  data-testid={`category-${category}`}
                >
                  {category === "all" ? "All" : category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="menu" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="menu" data-testid="tab-menu">
                <Utensils className="w-4 h-4 mr-2" />
                Menu ({filteredItems.length})
              </TabsTrigger>
              <TabsTrigger value="popular" data-testid="tab-popular">
                <Star className="w-4 h-4 mr-2" />
                Popular ({popularItems.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="menu" className="space-y-4" data-testid="menu-content">
              {filteredItems.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="text-muted-foreground">
                      <div className="text-4xl mb-4">🔍</div>
                      <h3 className="text-lg font-medium mb-2">No menu items found</h3>
                      <p>Try adjusting your search or category filter.</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4" data-testid="menu-items-grid">
                  {filteredItems.map((item: MenuItem) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      restaurant={restaurant}
                      onAddToCart={onAddToCart}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="popular" className="space-y-4" data-testid="popular-content">
              {popularItems.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="text-muted-foreground">
                      <div className="text-4xl mb-4">⭐</div>
                      <h3 className="text-lg font-medium mb-2">No popular items yet</h3>
                      <p>Check back later for trending menu items.</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {popularItems.map((item: MenuItem) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      restaurant={restaurant}
                      onAddToCart={onAddToCart}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}