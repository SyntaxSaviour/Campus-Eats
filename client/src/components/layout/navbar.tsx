import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Utensils, Menu, X } from "lucide-react";

export function Navbar() {
  const [location] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3" data-testid="logo-link">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Utensils className="text-primary-foreground text-lg" data-testid="logo-icon" />
              </div>
              <h1 className="text-xl font-bold text-primary" data-testid="app-title">CampusEats</h1>
            </Link>
            
            {!isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors" data-testid="nav-home">
                  Home
                </Link>
                <Link href="/auth/student/login" className="text-muted-foreground hover:text-primary transition-colors" data-testid="nav-student-login">
                  Student Login
                </Link>
                <Link href="/auth/restaurant/login" className="text-muted-foreground hover:text-primary transition-colors" data-testid="nav-restaurant-login">
                  Restaurant Login
                </Link>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <span className="text-sm text-muted-foreground" data-testid="user-greeting">
                  Welcome, {user?.name}!
                </span>
                <Button variant="outline" onClick={handleLogout} data-testid="logout-button">
                  Logout
                </Button>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed top-16 left-0 right-0 bg-card border-b border-border shadow-lg z-40 md:hidden" data-testid="mobile-menu">
          <div className="px-4 py-4 space-y-3">
            {!isAuthenticated ? (
              <>
                <Link 
                  href="/" 
                  className="block w-full text-left text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-nav-home"
                >
                  Home
                </Link>
                <Link 
                  href="/auth/student/login" 
                  className="block w-full text-left text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-nav-student-login"
                >
                  Student Login
                </Link>
                <Link 
                  href="/auth/restaurant/login" 
                  className="block w-full text-left text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-nav-restaurant-login"
                >
                  Restaurant Login
                </Link>
              </>
            ) : (
              <>
                <div className="text-sm text-muted-foreground border-b border-border pb-2" data-testid="mobile-user-greeting">
                  Welcome, {user?.name}!
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleLogout}
                  data-testid="mobile-logout-button"
                >
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
