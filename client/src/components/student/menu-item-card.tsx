import { Plus, Clock, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Restaurant, MenuItem } from "@shared/schema";

interface MenuItemCardProps {
  item: MenuItem;
  restaurant: Restaurant;
  onAddToCart: (item: MenuItem, restaurant: Restaurant) => void;
}

export function MenuItemCard({ item, restaurant, onAddToCart }: MenuItemCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow" data-testid={`menu-item-${item.id}`}>
      <div className="flex">
        {/* Item Image */}
        <div className="w-24 h-24 bg-muted flex-shrink-0">
          {item.imageUrl ? (
            <img 
              src={item.imageUrl} 
              alt={item.name}
              className="w-full h-full object-cover"
              data-testid="menu-item-image"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <div className="text-2xl">🍽️</div>
            </div>
          )}
        </div>
        
        {/* Item Details */}
        <CardContent className="flex-1 p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-sm" data-testid="menu-item-name">
              {item.name}
            </h4>
            <div className="flex items-center gap-2">
              {item.isPopular && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                  Popular
                </Badge>
              )}
              {item.discount && item.discount > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                  {item.discount}% OFF
                </Badge>
              )}
            </div>
          </div>
          
          {item.description && (
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2" data-testid="menu-item-description">
              {item.description}
            </p>
          )}
          
          {/* Tags and Info */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {item.dietaryTags && item.dietaryTags.length > 0 && (
              <div className="flex gap-1">
                {item.dietaryTags.slice(0, 2).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {item.dietaryTags.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{item.dietaryTags.length - 2}
                  </Badge>
                )}
              </div>
            )}
            
            {item.preparationTime && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="w-3 h-3 mr-1" />
                {item.preparationTime}m
              </div>
            )}
            
            {item.spiceLevel && item.spiceLevel > 0 && (
              <div className="flex items-center text-xs">
                {Array.from({ length: item.spiceLevel }, (_, i) => (
                  <Flame key={i} className="w-3 h-3 text-red-500" />
                ))}
              </div>
            )}
          </div>
          
          {/* Price and Add Button */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {item.discount && item.discount > 0 ? (
                <div className="flex items-center gap-1">
                  <span className="font-bold text-primary" data-testid="discounted-price">
                    ₹{Math.round(parseFloat(item.price) * (1 - item.discount / 100))}
                  </span>
                  <span className="text-xs text-muted-foreground line-through">
                    ₹{item.price}
                  </span>
                </div>
              ) : (
                <span className="font-bold text-primary" data-testid="menu-item-price">
                  ₹{item.price}
                </span>
              )}
            </div>
            
            <Button
              size="sm"
              onClick={() => onAddToCart(item, restaurant)}
              className="bg-primary hover:bg-primary/90"
              data-testid="add-to-cart-button"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
          
          {/* Nutrition info if available */}
          {item.nutritionInfo && (
            <div className="mt-2 pt-2 border-t">
              <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                {item.nutritionInfo.calories && (
                  <div className="text-center">
                    <div className="font-medium">{item.nutritionInfo.calories}</div>
                    <div>cal</div>
                  </div>
                )}
                {item.nutritionInfo.protein && (
                  <div className="text-center">
                    <div className="font-medium">{item.nutritionInfo.protein}g</div>
                    <div>protein</div>
                  </div>
                )}
                {item.nutritionInfo.carbs && (
                  <div className="text-center">
                    <div className="font-medium">{item.nutritionInfo.carbs}g</div>
                    <div>carbs</div>
                  </div>
                )}
                {item.nutritionInfo.fat && (
                  <div className="text-center">
                    <div className="font-medium">{item.nutritionInfo.fat}g</div>
                    <div>fat</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}