import { Star, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Restaurant } from "@shared/schema";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
}

export function RestaurantCard({ restaurant, onClick }: RestaurantCardProps) {
  return (
    <Card 
      className="overflow-hidden card-hover cursor-pointer" 
      onClick={onClick}
      data-testid={`restaurant-card-${restaurant.id}`}
    >
      <img 
        src={restaurant.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"} 
        alt={`${restaurant.name} restaurant`}
        className="w-full h-48 object-cover"
        data-testid={`restaurant-image-${restaurant.id}`}
      />
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg" data-testid={`restaurant-name-${restaurant.id}`}>
            {restaurant.name}
          </h3>
          <div className="flex items-center space-x-1">
            <Star className="text-yellow-500 text-sm fill-current" />
            <span className="text-sm text-muted-foreground" data-testid={`restaurant-rating-${restaurant.id}`}>
              {restaurant.rating}
            </span>
          </div>
        </div>
        <p className="text-muted-foreground text-sm mb-3" data-testid={`restaurant-cuisine-${restaurant.id}`}>
          {restaurant.cuisine} • {restaurant.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground" data-testid={`restaurant-price-${restaurant.id}`}>
            ₹{restaurant.priceForTwo} for two
          </span>
          <div className="flex items-center text-secondary font-medium text-sm">
            <Clock className="mr-1 text-xs" />
            <span data-testid={`restaurant-delivery-time-${restaurant.id}`}>
              {restaurant.deliveryTime}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
