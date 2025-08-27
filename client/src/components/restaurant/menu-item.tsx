import { Edit, Trash2, MoreVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { MenuItem } from "@shared/schema";

interface MenuItemProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (itemId: string) => void;
  onToggleAvailability: (itemId: string, isAvailable: boolean) => void;
}

export function MenuItemComponent({ item, onEdit, onDelete, onToggleAvailability }: MenuItemProps) {
  return (
    <Card className="overflow-hidden border border-border" data-testid={`menu-item-${item.id}`}>
      <img 
        src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"} 
        alt={item.name}
        className="w-full h-40 object-cover"
        data-testid={`menu-item-image-${item.id}`}
      />
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold" data-testid={`menu-item-name-${item.id}`}>
            {item.name}
          </h3>
          <Badge 
            variant={item.isAvailable ? "secondary" : "outline"}
            data-testid={`menu-item-availability-${item.id}`}
          >
            {item.isAvailable ? "Available" : "Out of Stock"}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm mb-3" data-testid={`menu-item-description-${item.id}`}>
          {item.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="font-semibold" data-testid={`menu-item-price-${item.id}`}>
            ₹{item.price}
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(item)}
              data-testid={`button-edit-${item.id}`}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  data-testid={`button-menu-${item.id}`}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => onToggleAvailability(item.id, !item.isAvailable)}
                  data-testid={`button-toggle-${item.id}`}
                >
                  {item.isAvailable ? "Mark Unavailable" : "Mark Available"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(item.id)}
                  className="text-destructive"
                  data-testid={`button-delete-${item.id}`}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Item
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
