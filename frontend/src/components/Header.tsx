import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary">VERTEX</h1>
              <p className="text-xs text-muted-foreground">ERP Management System</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-foreground hover:text-primary transition-colors">
              Features
            </a>
            <a href="#benefits" className="text-foreground hover:text-primary transition-colors">
              Benefits
            </a>
            <a href="#pricing" className="text-foreground hover:text-primary transition-colors">
              Pricing
            </a>
            <a href="#contact" className="text-foreground hover:text-primary transition-colors">
              Contact
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" className="text-foreground hover:text-primary" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button className="bg-primary hover:bg-primary-dark" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              <a href="#features" className="text-foreground hover:text-primary transition-colors">
                Features
              </a>
              <a href="#benefits" className="text-foreground hover:text-primary transition-colors">
                Benefits
              </a>
              <a href="#pricing" className="text-foreground hover:text-primary transition-colors">
                Pricing
              </a>
              <a href="#contact" className="text-foreground hover:text-primary transition-colors">
                Contact
              </a>
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="ghost" className="text-foreground hover:text-primary justify-start" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button className="bg-primary hover:bg-primary-dark justify-start" asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </div>
            </nav>
          </div>}
      </div>
    </header>;
};
export default Header;