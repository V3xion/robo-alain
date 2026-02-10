import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Service {
  id: string;
  name: string;
  price: string;
  description?: string | null;
  is_active: boolean;
}

const fallbackProducts = [
  { id: "1", name: "Fresh Bananas", price: "6.49 AED", description: "Fresh • 1 kg" },
  { id: "2", name: "Fresh Strawberries", price: "18.99 AED", description: "Fresh • 500g" },
  { id: "3", name: "Fresh Grapes", price: "15.99 AED", description: "Fresh • 500g" },
  { id: "4", name: "Organic Cucumbers", price: "4.99 AED", description: "Fresh • 500g" },
  { id: "5", name: "Fresh Lettuce", price: "3.99 AED", description: "Fresh • 1 head" },
  { id: "6", name: "Fresh Carrots", price: "4.49 AED", description: "Fresh • 1 kg" },
];

export const Services = () => {
  const [products, setProducts] = useState<Service[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      setProducts(data || []);
    };

    fetchProducts();
  }, []);

  const productList = products.length > 0 ? products : fallbackProducts;

  return (
    <section id="products" className="section-padding bg-background">
      <div className="container mx-auto">
        <div className="mb-10">
          <h2 className="font-display text-4xl font-bold">Popular Products</h2>
          <p className="text-muted-foreground">Over 1000+ quality products for your daily needs</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {productList.map((product) => (
            <article key={product.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow">
              <p className="text-xs uppercase text-muted-foreground">Fresh</p>
              <h3 className="font-semibold text-xl mt-1">{product.name}</h3>
              <p className="text-sm text-muted-foreground mt-2 inline-flex items-center gap-1">
                <Star className="w-3 h-3 text-[#f97316] fill-[#f97316]" />
                {product.description || "Top quality produce"}
              </p>
              <p className="text-primary text-2xl font-bold mt-4">{product.price}</p>
              <Button className="w-full mt-5">Add to Cart</Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
