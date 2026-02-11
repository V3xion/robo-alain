import { Mail, MapPin, Phone, Clock } from "lucide-react";

export const Contact = () => {
  return (
    <section id="contact" className="bg-primary text-primary-foreground py-10 px-4">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
        <div>
          <h3 className="font-display text-3xl font-bold">Get Exclusive Offers</h3>
          <p className="opacity-90">Subscribe for deals & new product updates</p>
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <input
            type="email"
            placeholder="Enter your email"
            className="rounded-full px-5 py-3 text-foreground w-full md:w-80"
          />
          <button className="rounded-full bg-[#f97316] hover:bg-[#ea580c] px-6 py-3 font-semibold">Subscribe</button>
        </div>
      </div>

      <div className="container mx-auto mt-10 pt-8 border-t border-white/30 grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
        <div>
          <h4 className="font-display text-2xl font-bold mb-3">Robo Al Ain</h4>
          <p className="opacity-90">Your trusted online supermarket in Al Ain. 1000+ products delivered fresh to your door.</p>
        </div>
        <div>
          <h5 className="font-semibold mb-3">Quick Links</h5>
          <ul className="space-y-2 opacity-90">
            <li>All Products</li>
            <li>Today's Deals</li>
            <li>Best Sellers</li>
            <li>My Orders</li>
          </ul>
        </div>
        <div>
          <h5 className="font-semibold mb-3">Categories</h5>
          <ul className="space-y-2 opacity-90">
            <li>Fresh</li>
            <li>Dairy & Eggs</li>
            <li>Bakery</li>
            <li>Beverages</li>
          </ul>
        </div>
        <div>
          <h5 className="font-semibold mb-3">Contact Us</h5>
          <ul className="space-y-2 opacity-90">
            <li className="inline-flex gap-2"><MapPin className="w-4 h-4" /> Al Ain Mall, Al Ain, UAE</li>
            <li className="inline-flex gap-2"><Phone className="w-4 h-4" /> +971 3 123 4567</li>
            <li className="inline-flex gap-2"><Mail className="w-4 h-4" /> orders@roboalain.ae</li>
            <li className="inline-flex gap-2"><Clock className="w-4 h-4" /> Delivery: 8 AM - 10 PM</li>
          </ul>
        </div>
      </div>
    </section>
  );
};
