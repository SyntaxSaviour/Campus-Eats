import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from 'wouter';
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, ShoppingCart } from 'lucide-react';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  orderData: any;
  clientSecret: string;
  platformFee: number;
  restaurantAmount: number;
}

const CheckoutForm = ({ orderData, clientSecret, platformFee, restaurantAmount }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/student/dashboard',
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Create the order in our database
        await apiRequest("POST", "/api/orders", {
          ...orderData,
          stripePaymentIntentId: paymentIntent.id,
          platformFee: platformFee.toString(),
          restaurantPayout: restaurantAmount.toString(),
          paymentStatus: 'paid',
          paymentMethod: 'card',
        });

        toast({
          title: "Payment Successful",
          description: "Your order has been placed successfully!",
        });

        // Clear cart and redirect
        localStorage.removeItem('cart');
        queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
        setLocation('/student/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <PaymentElement 
            options={{
              layout: 'tabs'
            }}
          />
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{orderData.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span>₹{orderData.deliveryFee}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Platform Fee:</span>
              <span>₹{platformFee}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>₹{orderData.totalAmount}</span>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!stripe || isProcessing}
            data-testid="button-confirm-payment"
          >
            {isProcessing ? "Processing..." : `Pay ₹${orderData.totalAmount}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [orderData, setOrderData] = useState<any>(null);
  const [platformFee, setPlatformFee] = useState(0);
  const [restaurantAmount, setRestaurantAmount] = useState(0);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Get order data from localStorage (set by cart)
    const savedOrderData = localStorage.getItem('checkoutData');
    if (!savedOrderData) {
      setLocation('/student/dashboard');
      return;
    }

    const orderInfo = JSON.parse(savedOrderData);
    setOrderData(orderInfo);

    // Create PaymentIntent
    apiRequest("POST", "/api/create-payment-intent", {
      orderId: orderInfo.id || 'temp-' + Date.now(),
      amount: parseFloat(orderInfo.totalAmount),
      restaurantId: orderInfo.restaurantId,
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setPlatformFee(data.platformFee);
        setRestaurantAmount(data.restaurantAmount);
      })
      .catch((error) => {
        console.error('Error creating payment intent:', error);
        setLocation('/student/dashboard');
      });
  }, [setLocation]);

  if (!clientSecret || !orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p>Preparing checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation('/student/dashboard')}
            data-testid="button-back-to-dashboard"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="font-medium">Delivery Address:</p>
                <p className="text-sm text-muted-foreground">{orderData.deliveryAddress}</p>
              </div>
              
              {orderData.specialInstructions && (
                <div className="space-y-2">
                  <p className="font-medium">Special Instructions:</p>
                  <p className="text-sm text-muted-foreground">{orderData.specialInstructions}</p>
                </div>
              )}

              <Separator />
              
              <div className="space-y-3">
                <p className="font-medium">Items:</p>
                {orderData.orderItems?.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm 
              orderData={orderData}
              clientSecret={clientSecret}
              platformFee={platformFee}
              restaurantAmount={restaurantAmount}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
}