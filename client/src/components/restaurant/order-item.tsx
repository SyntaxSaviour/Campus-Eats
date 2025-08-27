import { Clock, User, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@shared/schema";

interface OrderItemProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: string) => void;
}

export function OrderItem({ order, onUpdateStatus }: OrderItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "placed":
        return "bg-primary text-primary-foreground";
      case "preparing":
        return "bg-accent text-accent-foreground";
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
  const orderTime = new Date(order.createdAt!).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Card className="border border-border" data-testid={`order-item-${order.id}`}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg" data-testid={`order-number-${order.id}`}>
              Order #{order.id.slice(-4)}
            </h3>
            <p className="text-muted-foreground" data-testid={`order-time-${order.id}`}>
              Customer • {orderTime}
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-3 md:mt-0">
            <Badge className={getStatusColor(order.status)} data-testid={`order-status-${order.id}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
            <span className="font-semibold" data-testid={`order-total-${order.id}`}>
              ₹{order.totalAmount}
            </span>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          {orderItems.map((item: any, index: number) => (
            <div key={index} className="flex justify-between text-sm" data-testid={`order-item-detail-${order.id}-${index}`}>
              <span>{item.name} {item.quantity > 1 && `x${item.quantity}`}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>
        
        <div className="flex flex-col md:flex-row gap-3">
          {order.status === "placed" && (
            <>
              <Button
                onClick={() => onUpdateStatus(order.id, "preparing")}
                className="bg-primary hover:bg-primary/90"
                data-testid={`button-accept-${order.id}`}
              >
                Accept Order
              </Button>
              <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10"
                onClick={() => onUpdateStatus(order.id, "cancelled")}
                data-testid={`button-reject-${order.id}`}
              >
                Reject Order
              </Button>
            </>
          )}
          
          {order.status === "preparing" && (
            <>
              <Button
                onClick={() => onUpdateStatus(order.id, "ready")}
                className="bg-secondary hover:bg-secondary/90"
                data-testid={`button-ready-${order.id}`}
              >
                Mark as Ready
              </Button>
              <Button variant="outline" data-testid={`button-contact-${order.id}`}>
                <Phone className="mr-2 h-4 w-4" />
                Contact Customer
              </Button>
            </>
          )}
          
          {order.status === "ready" && (
            <Button
              onClick={() => onUpdateStatus(order.id, "delivered")}
              className="bg-secondary hover:bg-secondary/90"
              data-testid={`button-delivered-${order.id}`}
            >
              Mark as Delivered
            </Button>
          )}
          
          <Button variant="outline" data-testid={`button-details-${order.id}`}>
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
