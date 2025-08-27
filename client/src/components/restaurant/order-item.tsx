import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, MapPin } from "lucide-react";
import type { Order } from "@shared/schema";

interface OrderItemProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: string) => void;
}

export function OrderItem({ order, onUpdateStatus }: OrderItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "placed": return "bg-yellow-500";
      case "preparing": return "bg-blue-500";
      case "ready": return "bg-green-500";
      case "delivered": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "placed": return "preparing";
      case "preparing": return "ready";
      case "ready": return "delivered";
      default: return null;
    }
  };

  const getNextStatusLabel = (currentStatus: string) => {
    switch (currentStatus) {
      case "placed": return "Start Preparing";
      case "preparing": return "Mark Ready";
      case "ready": return "Mark Delivered";
      default: return null;
    }
  };

  const nextStatus = getNextStatus(order.status);
  const nextStatusLabel = getNextStatusLabel(order.status);

  return (
    <Card className="mb-4" data-testid={`order-item-${order.id}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <Badge className={`${getStatusColor(order.status)} text-white`} data-testid="order-status">
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
            <span className="font-semibold text-lg" data-testid="order-number">
              #{order.orderNumber}
            </span>
          </div>
          <div className="text-right">
            <div className="font-semibold text-lg" data-testid="order-total">₹{order.totalAmount}</div>
            <div className="text-sm text-muted-foreground flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {new Date(order.createdAt || '').toLocaleTimeString()}
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="w-4 h-4 mr-2" />
            Student ID: {order.studentId}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2" />
            {order.deliveryAddress}
          </div>
        </div>

        <div className="border-t pt-4 mb-4">
          <h4 className="font-semibold mb-2">Order Items:</h4>
          <div className="text-sm text-muted-foreground">
            {/* Parse orderItems JSON to display items */}
            {typeof order.orderItems === 'string' 
              ? JSON.parse(order.orderItems).map((item: any, index: number) => (
                  <div key={index} className="flex justify-between">
                    <span>{item.quantity}x {item.name}</span>
                    <span>₹{item.price}</span>
                  </div>
                ))
              : 'Order details unavailable'
            }
          </div>
        </div>

        {nextStatus && (
          <div className="flex justify-end">
            <Button 
              onClick={() => onUpdateStatus(order.id, nextStatus)}
              className="bg-primary hover:bg-primary/90"
              data-testid="update-order-status"
            >
              {nextStatusLabel}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}