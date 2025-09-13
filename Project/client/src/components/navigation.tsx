import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";

export default function Navigation() {
  const [location] = useLocation();
  
  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="text-primary font-arcade text-xl" data-testid="text-logo">BRIDGEN</div>
            <div className="hidden md:flex space-x-1">
              <div className="w-2 h-2 bg-pac-yellow rounded-full"></div>
              <div className="w-2 h-2 bg-pac-yellow rounded-full"></div>
              <div className="w-2 h-2 bg-pac-yellow rounded-full"></div>
            </div>
          </div>
          
          <div className="hidden md:flex space-x-8">
            <Link href="/" className={`transition-colors text-lg arcade-button ${
              isActive('/') ? 'text-primary' : 'text-foreground hover:text-primary'
            }`} data-testid="link-home">
              Home
            </Link>
            <Link href="/profile" className={`transition-colors text-lg arcade-button ${
              isActive('/profile') ? 'text-primary' : 'text-foreground hover:text-primary'
            }`} data-testid="link-profile">
              Profile
            </Link>
            <Link href="/features" className={`transition-colors text-lg arcade-button ${
              isActive('/features') ? 'text-primary' : 'text-foreground hover:text-primary'
            }`} data-testid="link-features">
              Features
            </Link>
            <Link href="/chat" className={`transition-colors text-lg arcade-button ${
              isActive('/chat') ? 'text-primary' : 'text-foreground hover:text-primary'
            }`} data-testid="link-chat">
              Chat
            </Link>
          </div>
          
          <Button variant="ghost" className="md:hidden text-foreground" data-testid="button-mobile-menu">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
