import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { X, Plus, Minus, ShoppingCart, MapPin, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from 'wouter';
import { apiRequest, queryClient } from "@/lib/queryClient";

interface CartItem {
  id: string;
  menuItemId: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  price: string;
  quantity: number;
  imageUrl?: string;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  total: number;
}

export function CartSidebar({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemoveItem, 
  total 
}: CartSidebarProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState({
    dormitory: "",
    roomNumber: "",
    phoneNumber: user?.phone || "",
    specialInstructions: "",
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Order placed successfully!",
        description: "Your order has been confirmed and is being prepared.",
      });
      onClose();
      // Clear cart would be handled by parent component
    },
    onError: (error: any) => {
      toast({
        title: "Order failed",
        description: error.message || "There was an error placing your order.",
        variant: "destructive",
      });
    },
  });

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    if (!deliveryDetails.dormitory || !deliveryDetails.roomNumber || !deliveryDetails.phoneNumber) {
      toast({
        title: "Missing delivery details",
        description: "Please provide all required delivery information.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      studentId: user?.id || "",
      restaurantId: items[0].restaurantId, // Assuming single restaurant per order
      orderItems: items.map(item => ({
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      subtotal: total.toString(),
      deliveryFee: "0",
      tax: "0",
      discount: "0",
      totalAmount: total.toString(),
      deliveryAddress: `${deliveryDetails.dormitory}, Room ${deliveryDetails.roomNumber}`,
      phoneNumber: deliveryDetails.phoneNumber,
      specialInstructions: deliveryDetails.specialInstructions,
      status: "placed",
      paymentStatus: "pending",
    };

    // Save order data for checkout page
    localStorage.setItem('checkoutData', JSON.stringify(orderData));
    
    // Navigate to checkout page
    setLocation('/student/checkout');
    onClose();
  };

  if (!isOpen) return null;

  const deliveryFee = 0; // Free campus delivery
  const finalTotal = total + deliveryFee;
  
  // Group items by restaurant
  const itemsByRestaurant = items.reduce((acc, item) => {
    if (!acc[item.restaurantId]) {
      acc[item.restaurantId] = {
        restaurantName: item.restaurantName,
        items: [],
      };
    }
    acc[item.restaurantId].items.push(item);
    return acc;
  }, {} as Record<string, { restaurantName: string; items: CartItem[] }>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50" data-testid="cart-sidebar">
      <div className="bg-background w-full max-w-md h-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold flex items-center" data-testid="cart-title">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Your Cart ({items.length})
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="close-cart">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-muted-foreground">
                <ShoppingCart className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
                <p>Add some delicious items to get started!</p>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {Object.entries(itemsByRestaurant).map(([restaurantId, { restaurantName, items: restaurantItems }]) => (
                <div key={restaurantId} className="space-y-3">
                  <h3 className="font-medium text-sm text-muted-foreground border-b pb-1">
                    {restaurantName}
                  </h3>
                  {restaurantItems.map((item) => (
                    <Card key={item.id} data-testid={`cart-item-${item.id}`}>
                      <CardContent className="p-3">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 bg-muted rounded flex-shrink-0">
                            {item.imageUrl ? (
                              <img 
                                src={item.imageUrl} 
                                alt={item.name}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                🍽️
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate" data-testid="cart-item-name">
                              {item.name}
                            </h4>
                            <div className="flex items-center justify-between mt-2">
                              <span className="font-semibold text-primary" data-testid="cart-item-price">
                                ₹{parseFloat(item.price) * item.quantity}
                              </span>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                  className="h-6 w-6 p-0"
                                  data-testid="decrease-quantity"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-sm font-medium w-6 text-center" data-testid="item-quantity">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                  className="h-6 w-6 p-0"
                                  data-testid="increase-quantity"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ))}

              {/* Delivery Details */}
              {!isCheckingOut ? (
                <div className="pt-4">
                  <Button 
                    onClick={() => setIsCheckingOut(true)}
                    className="w-full bg-primary hover:bg-primary/90"
                    data-testid="proceed-to-checkout"
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Delivery Details
                  </h3>
                  
                  <div className="space-y-3">
                    <Select 
                      value={deliveryDetails.dormitory} 
                      onValueChange={(value) => setDeliveryDetails(prev => ({ ...prev, dormitory: value }))}
                      data-testid="dormitory-select"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select dormitory" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kaari">Kaari</SelectItem>
                        <SelectItem value="Paari">Paari</SelectItem>
                        <SelectItem value="Oori">Oori</SelectItem>
                        <SelectItem value="Adhiyaman">Adhiyaman</SelectItem>
                        <SelectItem value="Agasthiyar">Agasthiyar</SelectItem>
                        <SelectItem value="Nelson Mandela">Nelson Mandela</SelectItem>
                        <SelectItem value="Sannasi">Sannasi</SelectItem>
                        <SelectItem value="Manoranjitham">Manoranjitham</SelectItem>
                        <SelectItem value="Mullai">Mullai</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Input
                      placeholder="Room number"
                      value={deliveryDetails.roomNumber}
                      onChange={(e) => setDeliveryDetails(prev => ({ ...prev, roomNumber: e.target.value }))}
                      data-testid="room-number-input"
                    />
                    
                    <Input
                      placeholder="Phone number"
                      value={deliveryDetails.phoneNumber}
                      onChange={(e) => setDeliveryDetails(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      data-testid="phone-number-input"
                    />
                    
                    <Textarea
                      placeholder="Special instructions (optional)"
                      value={deliveryDetails.specialInstructions}
                      onChange={(e) => setDeliveryDetails(prev => ({ ...prev, specialInstructions: e.target.value }))}
                      rows={2}
                      data-testid="special-instructions"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            {/* Order Summary */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span data-testid="subtotal">₹{total}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery fee</span>
                <span className="text-green-600" data-testid="delivery-fee">Free</span>
              </div>
              <div className="flex justify-between font-semibold text-base border-t pt-2">
                <span>Total</span>
                <span data-testid="final-total">₹{finalTotal}</span>
              </div>
            </div>

            {isCheckingOut && (
              <div className="space-y-2">
                <Button
                  onClick={handleCheckout}
                  disabled={!deliveryDetails.dormitory || !deliveryDetails.roomNumber || !deliveryDetails.phoneNumber}
                  className="w-full bg-primary hover:bg-primary/90"
                  data-testid="place-order-button"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Proceed to Payment - ₹{finalTotal}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCheckingOut(false)}
                  className="w-full"
                  data-testid="back-to-cart"
                >
                  Back to Cart
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}