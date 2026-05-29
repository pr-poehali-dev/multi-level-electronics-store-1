import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomePage from "@/components/HomePage";
import CatalogPage from "@/components/CatalogPage";
import CartPage from "@/components/CartPage";
import DeliveryPage from "@/components/DeliveryPage";
import ReviewsPage from "@/components/ReviewsPage";
import AboutPage from "@/components/AboutPage";
import ContactsPage from "@/components/ContactsPage";

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: { id: number; name: string; price: number }) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id: number, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(i => i.id !== id));
    } else {
      setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
    }
  };

  const removeItem = (id: number) => setCart(prev => prev.filter(i => i.id !== id));
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  const renderPage = () => {
    switch (currentPage) {
      case "home": return <HomePage setCurrentPage={setCurrentPage} />;
      case "catalog": return <CatalogPage addToCart={addToCart} />;
      case "cart": return <CartPage cart={cart} updateQty={updateQty} removeItem={removeItem} setCurrentPage={setCurrentPage} />;
      case "delivery": return <DeliveryPage />;
      case "reviews": return <ReviewsPage />;
      case "about": return <AboutPage />;
      case "contacts": return <ContactsPage />;
      default: return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <TooltipProvider>
      <Toaster />
      <div className="min-h-screen" style={{ background: "var(--dark-bg)" }}>
        <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} cartCount={cartCount} />
        <main>{renderPage()}</main>
        {currentPage !== "cart" && <Footer setCurrentPage={setCurrentPage} />}
      </div>
    </TooltipProvider>
  );
}
