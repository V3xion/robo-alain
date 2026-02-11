import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Search, ShoppingCart, Truck, MapPin, X } from "lucide-react";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "Fresh", href: "#categories" },
  { name: "Deals", href: "#deals" },
  { name: "Products", href: "#products" },
  { name: "Contact", href: "#contact" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: "smooth" });
    setIsOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-2 text-xs md:text-sm flex items-center justify-between gap-4">
          <div className="hidden md:flex items-center gap-4">
            <span className="inline-flex items-center gap-1"><Truck className="h-4 w-4" /> Free delivery on orders over 100 AED</span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> Delivering to Al Ain, UAE</span>
          </div>
          <span className="ml-auto">Customer Service: +971 3 123 4567</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <a href="#home" className="font-display text-2xl font-bold text-primary whitespace-nowrap">
            Robo Al Ain
          </a>

          <div className="hidden md:flex items-center bg-secondary rounded-full px-4 py-2 flex-1 max-w-2xl">
            <Search className="w-5 h-5 text-muted-foreground mr-2" />
            <span className="text-muted-foreground">Search from over 1000+ products...</span>
          </div>

          <Button variant="default" className="rounded-full px-5 bg-[#f97316] hover:bg-[#ea580c]">
            <ShoppingCart className="w-4 h-4 mr-1" /> 0
          </Button>
        </div>

        <nav className="hidden md:flex items-center gap-8 pt-3 text-sm font-medium">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => scrollToSection(link.href)}
              className="text-foreground/90 hover:text-primary transition-colors"
            >
              {link.name}
            </button>
          ))}
        </nav>

        {isOpen && (
          <nav className="md:hidden pt-4 pb-1 border-t mt-3 animate-fade-in">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className="text-left text-foreground/90 hover:text-primary transition-colors"
                >
                  {link.name}
                </button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
