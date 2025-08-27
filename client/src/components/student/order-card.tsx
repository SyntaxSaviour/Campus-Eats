import { Clock, MapPin, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@shared/schema";

interface OrderCardProps {
  order: Order;
  restaurantName: string;
}

export function OrderCard({ order, restaurantName }: OrderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "placed":
        return "bg-primary text-primary-foreground";
      case "preparing":
        return "bg-accent text-accent-foreground status-badge";
      case "ready":
        return "bg-secondary text-secondary-foreground";
      case "delivered":
        return "bg-muted text-muted-foreground";
      case "cancelled":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const orderItems = JSON.parse(order.orderItems);

  return (
    <Card className="bg-accent/10 border-accent/20" data-testid={`order-card-${order.id}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg" data-testid={`order-title-${order.id}`}>
            Your Active Order
          </h3>
          <Badge className={getStatusColor(order.status)} data-testid={`order-status-${order.id}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {restaurantName.charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <h4 className="font-medium" data-testid={`order-restaurant-${order.id}`}>
              {restaurantName}
            </h4>
            <div className="text-muted-foreground text-sm">
              {orderItems.map((item: any, index: number) => (
                <div key={index} data-testid={`order-item-${order.id}-${index}`}>
                  {item.name} {item.quantity > 1 && `x${item.quantity}`}
                </div>
              ))}
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold" data-testid={`order-total-${order.id}`}>
              ₹{order.totalAmount}
            </div>
            {order.status === "preparing" && (
              <div className="text-sm text-muted-foreground">ETA: 15 min</div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button 
            variant="link" 
            className="text-primary hover:underline text-sm p-0"
            data-testid={`button-track-${order.id}`}
          >
            <MapPin className="mr-1 h-3 w-3" />
            Track Order
          </Button>
          {order.status !== "delivered" && order.status !== "cancelled" && (
            <Button 
              variant="link" 
              className="text-destructive hover:underline text-sm p-0"
              data-testid={`button-cancel-${order.id}`}
            >
              Cancel Order
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
