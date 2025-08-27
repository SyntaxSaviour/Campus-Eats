import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Edit2, Trash2, Clock } from "lucide-react";
import type { MenuItem } from "@shared/schema";

interface MenuItemComponentProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (itemId: string) => void;
  onToggleAvailability: (itemId: string, isAvailable: boolean) => void;
}

export function MenuItemComponent({ 
  item, 
  onEdit, 
  onDelete, 
  onToggleAvailability 
}: MenuItemComponentProps) {
  return (
    <Card className="overflow-hidden" data-testid={`menu-item-${item.id}`}>
      <div className="aspect-video relative bg-muted">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.name}
            className="w-full h-full object-cover"
            data-testid="menu-item-image"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="text-4xl mb-2">🍽️</div>
              <p className="text-sm">No image</p>
            </div>
          </div>
        )}
        
        {/* Availability overlay */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="secondary" className="bg-red-500 text-white">
              Unavailable
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg" data-testid="menu-item-name">
            {item.name}
          </h3>
          <span className="font-bold text-lg text-primary" data-testid="menu-item-price">
            ₹{item.price}
          </span>
        </div>
        
        {item.description && (
          <p className="text-sm text-muted-foreground mb-3" data-testid="menu-item-description">
            {item.description}
          </p>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" data-testid="menu-item-category">
              {item.category}
            </Badge>
            {item.preparationTime && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-1" />
                {item.preparationTime}m
              </div>
            )}
          </div>
          
          {item.spiceLevel && item.spiceLevel > 0 && (
            <div className="flex" data-testid="spice-level">
              {Array.from({ length: item.spiceLevel }, (_, i) => (
                <span key={i} className="text-red-500">🌶️</span>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <label htmlFor={`availability-${item.id}`} className="text-sm font-medium">
              Available
            </label>
            <Switch
              id={`availability-${item.id}`}
              checked={item.isAvailable}
              onCheckedChange={(checked) => onToggleAvailability(item.id, checked ?? false)}
              data-testid="availability-switch"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(item)}
              data-testid="edit-menu-item"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(item.id)}
              className="text-red-600 hover:text-red-700"
              data-testid="delete-menu-item"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}