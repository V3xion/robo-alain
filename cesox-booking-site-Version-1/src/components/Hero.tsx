import { Button } from "@/components/ui/button";

const heroImage =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80";

export const Hero = () => {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="home" className="pt-36 md:pt-40 pb-14 px-4">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex rounded-full bg-[#fff2e8] text-[#f97316] px-4 py-2 text-sm font-semibold mb-5">
              % Up to 30% OFF on Fresh Produce
            </span>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground leading-tight">
              Fresh Groceries
              <br />
              <span className="text-primary">Delivered to Your Door</span>
            </h1>
            <p className="text-muted-foreground text-lg mt-5 max-w-xl">
              Shop from 1000+ quality products. Fresh fruits, vegetables, dairy, meat and more with same-day delivery in Al Ain.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" className="rounded-full px-8">Start Shopping</Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 border-[#f97316] text-[#f97316] hover:bg-[#fff2e8]" onClick={() => scrollToSection("#deals")}>View Today's Deals</Button>
            </div>
          </div>

          <div className="relative">
            <img
              src={heroImage}
              alt="Fresh vegetables supermarket shelves"
              className="rounded-3xl w-full h-[480px] object-cover shadow-xl"
            />
            <div className="absolute -bottom-6 left-6 rounded-2xl bg-[#f97316] text-white px-6 py-4 shadow-lg">
              <p className="text-4xl font-bold leading-none">30% OFF</p>
              <p className="text-lg">Fresh Picks</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
