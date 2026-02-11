const categories = [
  { name: "Fresh", items: "265 items", image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=200&q=80" },
  { name: "Dairy & Eggs", items: "85 items", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=200&q=80" },
  { name: "Bakery", items: "65 items", image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=200&q=80" },
  { name: "Seafood", items: "78 items", image: "https://images.unsplash.com/photo-1579631542720-3a87824fff86?auto=format&fit=crop&w=200&q=80" },
  { name: "Meat", items: "92 items", image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=200&q=80" },
  { name: "Beverages", items: "110 items", image: "https://images.unsplash.com/photo-1551024709-8f23befc6cf7?auto=format&fit=crop&w=200&q=80" },
  { name: "Frozen", items: "88 items", image: "https://images.unsplash.com/photo-1529472119196-cb724127a98e?auto=format&fit=crop&w=200&q=80" },
  { name: "Snacks", items: "134 items", image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=200&q=80" },
  { name: "Deals", items: "56 items", image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=200&q=80" },
];

export const About = () => {
  return (
    <section id="categories" className="section-padding pt-10 bg-background">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-4xl font-bold">Shop by Category</h2>
          <button className="text-primary font-semibold">View All →</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-4">
          {categories.map((category) => (
            <div key={category.name} className="rounded-xl border border-border bg-card p-4 text-center hover:shadow-md transition">
              <img
                src={category.image}
                alt={category.name}
                className="w-14 h-14 rounded-full object-cover mx-auto mb-3"
              />
              <h3 className="font-semibold text-sm">{category.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{category.items}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
