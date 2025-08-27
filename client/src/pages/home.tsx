import { Link } from "wouter";
import { GraduationCap, Store, Clock, University, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="pt-16 min-h-screen" data-testid="home-page">
      {/* Hero Section */}
      <section className="hero-gradient py-20 px-4" data-testid="hero-section">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6" data-testid="hero-title">
            Hungry? We've got you covered!
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto" data-testid="hero-description">
            Order from your favorite campus restaurants and get food delivered right to your dorm or study spot.
          </p>
          <div className="grid md:grid-cols-2 gap-6 max-w-lg mx-auto">
            <Link href="/auth/student/signup">
              <Button 
                className="bg-white/20 backdrop-blur-md border border-white/30 text-white py-4 px-8 rounded-xl font-semibold hover:bg-white/30 transition-all card-hover w-full h-auto"
                data-testid="student-signup-button"
              >
                <GraduationCap className="mr-3" />
                I'm a Student
              </Button>
            </Link>
            <Link href="/auth/restaurant/signup">
              <Button 
                className="bg-white/20 backdrop-blur-md border border-white/30 text-white py-4 px-8 rounded-xl font-semibold hover:bg-white/30 transition-all card-hover w-full h-auto"
                data-testid="restaurant-signup-button"
              >
                <Store className="mr-3" />
                I'm a Restaurant
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30" data-testid="features-section">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground" data-testid="features-title">
            Why Choose CampusEats?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6 card-hover" data-testid="feature-delivery">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="text-primary-foreground text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Quick Delivery</h3>
                <p className="text-muted-foreground">Get your food delivered in 15-30 minutes right to your campus location.</p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 card-hover" data-testid="feature-exclusive">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <University className="text-secondary-foreground text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Campus Exclusive</h3>
                <p className="text-muted-foreground">Only for verified students and campus restaurants. Safe and secure.</p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 card-hover" data-testid="feature-budget">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet className="text-accent-foreground text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Student Friendly</h3>
                <p className="text-muted-foreground">Special discounts and affordable prices designed for student budgets.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
