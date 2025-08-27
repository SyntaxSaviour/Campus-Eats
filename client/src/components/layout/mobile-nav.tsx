import { Link, useLocation } from "wouter";
import { Home, Search, Receipt, User } from "lucide-react";

export function MobileNav() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden bg-card border-t border-border z-40" data-testid="mobile-nav-bar">
      <div className="flex items-center justify-around py-2">
        <Link
          href="/student/dashboard"
          className={`flex flex-col items-center py-2 px-4 ${
            isActive('/student/dashboard') ? 'text-primary' : 'text-muted-foreground'
          }`}
          data-testid="mobile-nav-home"
        >
          <Home className="text-lg mb-1" />
          <span className="text-xs">Home</span>
        </Link>
        
        <button 
          className="flex flex-col items-center py-2 px-4 text-muted-foreground"
          data-testid="mobile-nav-search"
        >
          <Search className="text-lg mb-1" />
          <span className="text-xs">Search</span>
        </button>
        
        <button 
          className="flex flex-col items-center py-2 px-4 text-muted-foreground"
          data-testid="mobile-nav-orders"
        >
          <Receipt className="text-lg mb-1" />
          <span className="text-xs">Orders</span>
        </button>
        
        <button 
          className="flex flex-col items-center py-2 px-4 text-muted-foreground"
          data-testid="mobile-nav-profile"
        >
          <User className="text-lg mb-1" />
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </div>
  );
}
