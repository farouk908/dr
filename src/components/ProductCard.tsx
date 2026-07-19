import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Star, Eye, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onQuickAdd: (product: Product, color: string, size: string) => void;
}

export default function ProductCard({ product, onViewDetails, onQuickAdd }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Format currency in Nigerian Naira
  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const isVideo = (url: string) => /\.(mp4|webm|ogg)$/i.test(url);

  const getColorHex = (color: string): string => {
    const c = color.toLowerCase();
    if (c.includes('black') || c.includes('noir') || c.includes('dark') || c.includes('onyx')) return '#111111';
    if (c.includes('nude') || c.includes('beige')) return '#e6c2a0';
    if (c.includes('bronze')) return '#cd7f32';
    if (c.includes('pink') || c.includes('rose') || c.includes('orchid')) return '#fbcfe8';
    if (c.includes('indigo') || c.includes('blue') || c.includes('navy')) return '#1e3a8a';
    if (c.includes('cream') || c.includes('ivory')) return '#fafaf9';
    if (c.includes('gold') || c.includes('amber') || c.includes('champagne')) return '#fef08a';
    if (c.includes('coral')) return '#f87171';
    if (c.includes('green')) return '#15803d';
    return '#94a3b8';
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative bg-white rounded-none border border-brand-blue-primary/10 overflow-hidden transition-all duration-300 flex flex-col h-full text-left"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* Product Image Stage */}
      <div 
        onClick={() => onViewDetails(product)}
        className="relative w-full aspect-[4/5] bg-brand-cream overflow-hidden cursor-pointer"
      >
        
        {/* Dual-layered image cross-fade on hover */}
        <div className="absolute inset-0 w-full h-full">
          {/* Primary View */}
          {isVideo(product.images[0]) ? (
            <motion.video
              src={product.images[0]}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700"
              animate={{ scale: isHovered ? 1.03 : 1, opacity: isHovered ? 0 : 1 }}
            />
          ) : (
            <motion.img
              src={product.images[0]}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700"
              animate={{ scale: isHovered ? 1.03 : 1, opacity: isHovered ? 0 : 1 }}
              referrerPolicy="no-referrer"
            />
          )}
          
          {/* Secondary Detail Angle (Smooth Cross-Fade) */}
          {isVideo(product.images[1] || product.images[0]) ? (
            <motion.video
              src={product.images[1] || product.images[0]}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700"
              initial={{ opacity: 0 }}
              animate={{ scale: isHovered ? 1.03 : 1, opacity: isHovered ? 1 : 0 }}
            />
          ) : (
            <motion.img
              src={product.images[1] || product.images[0]}
              alt={`${product.name} alternate view`}
              className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700"
              initial={{ opacity: 0 }}
              animate={{ scale: isHovered ? 1.03 : 1, opacity: isHovered ? 1 : 0 }}
              referrerPolicy="no-referrer"
            />
          )}
        </div>

        {/* Floating Custom Accent Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.isBestSeller && (
            <span className="bg-brand-blue-primary text-brand-cream text-[9px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-none border border-brand-pink-medium/30 shadow-xs flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-brand-pink-medium" />
              Best Seller
            </span>
          )}
          {product.isNew && (
            <span className="bg-brand-pink-light text-brand-blue-primary border border-brand-blue-primary text-[9px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-none">
              New In
            </span>
          )}
          {product.discountPercentage && (
            <span className="bg-brand-pink-primary text-white text-[9px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-none">
              {product.discountPercentage}% Off
            </span>
          )}
        </div>

        {/* View Details Floating Icon on Hover */}
        <div className="absolute inset-0 bg-brand-blue-deep/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-white text-brand-blue-primary px-4 py-2 text-[10px] font-bold tracking-widest uppercase rounded-none border border-brand-blue-primary/20">
            View Details
          </div>
        </div>

      </div>

      {/* Product Information Body */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1 bg-white">
        
        {/* Monospace designer SKU code */}
        <span className="font-mono text-[8px] sm:text-[9px] text-brand-blue-sky uppercase tracking-widest font-bold">
          {product.sku}
        </span>
        
        {/* Product Title */}
        <h3 
          onClick={() => onViewDetails(product)}
          className="font-serif text-xs sm:text-sm font-semibold text-brand-blue-primary mt-1 hover:text-brand-pink-medium cursor-pointer line-clamp-1 transition-colors"
        >
          {product.name}
        </h3>

        {/* Color Choices Available */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1 mt-1.5 mb-0.5">
            <span className="text-[9px] font-mono uppercase text-brand-blue-sky/70 tracking-wide mr-1">Colors:</span>
            <div className="flex gap-1 flex-wrap">
              {product.colors.map((color) => (
                <span 
                  key={color} 
                  className="w-2.5 h-2.5 rounded-full border border-slate-200 inline-block shadow-xs" 
                  style={{ backgroundColor: getColorHex(color) }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}

        {/* Pricing Rows & Quick Add */}
        <div className="mt-auto pt-2.5 sm:pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-brand-blue-primary/5">
          
          <div className="flex flex-col">
            {product.originalPrice ? (
              <div className="flex items-baseline gap-1 flex-wrap">
                <span className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-blue-primary whitespace-nowrap tracking-tighter">
                  {formatNaira(product.price)}
                </span>
                <span className="font-serif text-lg sm:text-xl lg:text-2xl text-brand-blue-sky/60 line-through whitespace-nowrap">
                  {formatNaira(product.originalPrice)}
                </span>
              </div>
            ) : (
              <span className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-blue-primary whitespace-nowrap tracking-tighter">
                {formatNaira(product.price)}
              </span>
            )}
            <span className="text-[8px] sm:text-[9px] text-brand-pink-medium font-mono font-semibold tracking-wide">
              Lagos
            </span>
          </div>

          {/* Quick Add To Bag CTA Button */}
          <button
            onClick={() => {
              if (product.sizes.length === 1 && product.sizes[0] === 'One Size Fits All' && product.colors.length === 1) {
                onQuickAdd(product, product.colors[0], product.sizes[0]);
              } else {
                onViewDetails(product);
              }
            }}
            className="flex items-center justify-center gap-1 h-8 sm:h-9 px-2 sm:px-3 rounded-none bg-brand-blue-primary hover:bg-white text-white hover:text-brand-blue-primary border border-brand-blue-primary transition-all duration-300 font-bold text-[9px] sm:text-[10px] uppercase tracking-wider cursor-pointer w-full sm:w-auto mt-1 sm:mt-0"
            title="Quick add to shopping bag"
          >
            <ShoppingBag className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            <span>Add</span>
          </button>

        </div>

      </div>

    </div>
  );
}
