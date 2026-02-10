import { Flame, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const deals = [
  { name: "Sweet Oranges", price: "8.99 AED", oldPrice: "11.99", image: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=600&q=80", discount: "25% OFF", rating: "4.7", unit: "1 kg" },
  { name: "Ripe Mangoes", price: "24.99 AED", oldPrice: "29.99", image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80", discount: "17% OFF", rating: "4.8", unit: "1 kg" },
  { name: "Fresh Tomatoes", price: "5.49 AED", oldPrice: "7.99", image: "https://images.unsplash.com/photo-1546470427-e5ac89cd0b51?auto=format&fit=crop&w=600&q=80", discount: "31% OFF", rating: "4.6", unit: "1 kg" },
  { name: "Bell Peppers Mix", price: "9.99 AED", oldPrice: "12.99", image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80", discount: "23% OFF", rating: "4.6", unit: "500g" },
];

export const BookingSection = () => {
  return (
    <section id="deals" className="section-padding bg-secondary">
      <div className="container mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-[#f97316] mb-2">
              <Flame className="w-5 h-5" />
              <span className="font-semibold">Today's Hot Deals</span>
            </div>
            <p className="text-muted-foreground">Limited time offers - Don't miss out!</p>
          </div>
          <span className="bg-background border border-border rounded-full px-5 py-2 font-semibold text-sm">Ends in: 12:45:30</span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {deals.map((deal) => (
            <article key={deal.name} className="rounded-xl overflow-hidden bg-card border border-border">
              <div className="relative">
                <img src={deal.image} alt={deal.name} className="w-full h-56 object-cover" />
                <span className="absolute top-3 left-3 bg-[#f97316] text-white text-xs px-2 py-1 rounded-md font-semibold">{deal.discount}</span>
              </div>
              <div className="p-4">
                <p className="text-xs uppercase text-muted-foreground">Fresh</p>
                <h3 className="font-semibold text-lg mb-2">{deal.name}</h3>
                <p className="text-sm text-muted-foreground inline-flex items-center gap-1"><Star className="w-3 h-3 text-[#f97316] fill-[#f97316]" />{deal.rating} • {deal.unit}</p>
                <div className="mt-2 mb-4 flex items-center gap-2">
                  <span className="text-primary text-2xl font-bold">{deal.price}</span>
                  <span className="text-muted-foreground line-through">{deal.oldPrice}</span>
                </div>
                <Button className="w-full">Add to Cart</Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
