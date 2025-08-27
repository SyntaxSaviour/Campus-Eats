import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star, Clock, MapPin, Eye, ChefHat } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RestaurantModal } from "./restaurant-modal";
import type { Restaurant } from "@shared/schema";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onAddToCart: (item: any, restaurant: Restaurant) => void;
  dietaryFilters: string[];
}

export function RestaurantCard({ restaurant, onAddToCart, dietaryFilters }: RestaurantCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: menuItems = [] } = useQuery({
    queryKey: ["/api/restaurants", restaurant.id, "menu"],
  });

  const availableItems = menuItems.filter((item: any) => item.isAvailable);
  const popularItems = menuItems.filter((item: any) => item.isPopular);

  const hasMatchingDietaryOptions = dietaryFilters.length === 0 || 
    menuItems.some((item: any) => 
      item.dietaryTags && dietaryFilters.every(filter => 
        item.dietaryTags.includes(filter)
      )
    );

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" data-testid={`restaurant-card-${restaurant.id}`}>
        <div className="aspect-video relative bg-muted">
          {restaurant.imageUrl ? (
            <img 
              src={restaurant.imageUrl} 
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              data-testid="restaurant-image"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <ChefHat className="mx-auto h-12 w-12 mb-2" />
                <p className="text-sm">No image available</p>
              </div>
            </div>
          )}
          
          {/* Quick stats overlay */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className="bg-green-500 text-white">
              {availableItems.length} items
            </Badge>
            {popularItems.length > 0 && (
              <Badge className="bg-yellow-500 text-white">
                {popularItems.length} popular
              </Badge>
            )}
          </div>

          {!restaurant.isActive && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="secondary" className="bg-red-500 text-white">
                Currently Closed
              </Badge>
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg truncate pr-2" data-testid="restaurant-name">
              {restaurant.name}
            </h3>
            <div className="flex items-center text-sm text-muted-foreground min-w-fit">
              <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
              <span data-testid="restaurant-rating">{restaurant.rating || "4.5"}</span>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <Badge variant="outline" className="mr-2" data-testid="restaurant-cuisine">
              {restaurant.cuisine}
            </Badge>
            <span>₹{restaurant.priceForTwo} for two</span>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span data-testid="delivery-time">{restaurant.deliveryTime}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span>Campus</span>
            </div>
          </div>

          {restaurant.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2" data-testid="restaurant-description">
              {restaurant.description}
            </p>
          )}

          {/* Dietary badges */}
          {hasMatchingDietaryOptions && dietaryFilters.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {dietaryFilters.map(filter => (
                <Badge key={filter} variant="secondary" className="text-xs bg-green-100 text-green-800">
                  {filter}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => setIsModalOpen(true)}
              data-testid="view-menu-button"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Menu
            </Button>
            {availableItems.length > 0 && restaurant.isActive && (
              <Button 
                size="sm" 
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={() => setIsModalOpen(true)}
                data-testid="order-now-button"
              >
                Order Now
              </Button>
            )}
          </div>
          
          {!restaurant.isActive && (
            <div className="mt-2 text-center">
              <span className="text-sm text-red-600">Restaurant is currently closed</span>
            </div>
          )}
        </CardContent>
      </Card>

      <RestaurantModal
        restaurant={restaurant}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={onAddToCart}
        dietaryFilters={dietaryFilters}
      />
    </>
  );
}