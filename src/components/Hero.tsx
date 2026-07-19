import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin } from 'lucide-react';
import { Product } from '../types';
import logoBg from '../assets/images/dr_bodyshaper_logo_1783025195352.jpg';

interface HeroProps {
  products: Product[];
  onExploreClick: () => void;
  onViewProduct: (product: Product) => void;
}

export default function Hero({ products, onExploreClick, onViewProduct }: HeroProps) {
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProductIndex((prev) => (prev + 1) % products.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [products.length]);

  const currentProduct = products[currentProductIndex];

  return (
    <section 
      id="hero-section" 
      className="relative bg-brand-cream border-b border-brand-blue-primary/10 py-16 md:py-24 overflow-hidden"
      style={{
        backgroundImage: `url(${logoBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay to make text readable */}
      <div className="absolute inset-0 bg-black/60 z-0" />
      
      {/* Absolute Decorative Glow Orb */}
      <div className="absolute top-1/4 right-1/10 w-96 h-96 bg-brand-pink-primary/40 rounded-full blur-3xl z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Premium Editorial Typography & Simple Description */}
          <div className="lg:col-span-12 space-y-6 text-left">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-sm border border-brand-pink-primary/50 rounded-none shadow-xs">
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-white font-bold">
                DR BODYSHAPER • LAGOS
              </span>
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05]">
              Come find <br />
              <span className="font-normal italic text-brand-pink-primary font-serif">
                ur right fit
              </span>
            </h1>

            <p className="text-white/90 font-normal text-xs sm:text-sm max-w-md leading-relaxed">
              Premium sleepwear and body shapewear. Comfortable fit and support all day.
            </p>

            <div className="flex items-center gap-2 text-white/80 text-xs sm:text-sm font-light mt-2">
              <MapPin className="w-4 h-4 text-brand-pink-primary" />
              <span>Faith Plaza beside Dubai Mall, Breadfruit, Lagos, Nigeria</span>
            </div>

            {/* Action CTAs - Simplified */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                id="hero-explore-btn"
                onClick={onExploreClick}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-brand-pink-primary hover:bg-white text-white hover:text-brand-pink-primary border border-brand-pink-primary rounded-none font-bold text-[11px] tracking-[0.2em] uppercase transition-all duration-300 cursor-pointer"
              >
                Explore Collection
              </button>
            </div>

          </div>

        </div>
      </div>

    </section>
  );
}
