import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, Trash2, ShoppingBag, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: CartDrawerProps) {
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  // Calculate cart metrics
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 150000;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const missingForFreeShipping = freeShippingThreshold - subtotal;
  const freeShippingPercent = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Mock brief update loading effect
  const handleQuantityChange = (index: number, quantity: number) => {
    setIsUpdating(index);
    setTimeout(() => {
      onUpdateQuantity(index, quantity);
      setIsUpdating(null);
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dimmed Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-brand-blue-primary/30"
          />

          {/* Sliding Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col h-full text-brand-blue-primary"
          >
            {/* Header */}
            <div className="p-8 border-b border-dotted border-brand-pink-medium flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl font-bold tracking-tight text-brand-blue-primary">
                  Your Selection
                </h2>
                <span className="font-mono text-xs text-brand-blue-sky/80">({cartItems.length})</span>
              </div>
              <button
                onClick={onClose}
                className="text-[10px] uppercase font-bold tracking-widest text-brand-blue-sky hover:text-brand-blue-primary transition-colors cursor-pointer"
                aria-label="Close Cart"
              >
                Close
              </button>
            </div>

            {/* Free Shipping Dynamic Progress Tracker */}
            {cartItems.length > 0 && (
              <div className="bg-brand-pink-light/40 p-4 border-b border-brand-blue-primary/5">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="font-semibold text-brand-blue-primary flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-brand-pink-medium" />
                    {isFreeShipping 
                      ? "You've unlocked Complimentary Shipping!" 
                      : `Add ${formatNaira(missingForFreeShipping)} more for Free Shipping`}
                  </span>
                  <span className="font-mono font-bold text-brand-pink-deep">
                    {Math.round(freeShippingPercent)}%
                  </span>
                </div>
                <div className="w-full bg-brand-pink-light h-1 rounded-none overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${freeShippingPercent}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full bg-brand-pink-medium"
                  />
                </div>
              </div>
            )}

            {/* Drawer Body - Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="p-4 bg-brand-pink-light rounded-none text-brand-blue-primary">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif text-base font-bold text-brand-blue-primary">Your Bag is Empty</h3>
                    <p className="text-xs text-brand-blue-sky/70 max-w-xs leading-relaxed">
                      Dr Bodyshaper luxury shapewear and silk garments are waiting to sculpt your beauty.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 border border-brand-blue-primary hover:bg-brand-blue-primary hover:text-white text-brand-blue-primary text-xs font-bold uppercase tracking-widest rounded-none transition-all duration-300"
                  >
                    Continue Browsing
                  </button>
                </div>
              ) : (
                cartItems.map((item, index) => (
                  <motion.div
                    key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`flex gap-4 pb-4 border-b border-brand-blue-primary/5 last:border-0 ${
                      isUpdating === index ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    {/* Item Image */}
                    <div className="w-16 h-20 bg-brand-pink-light rounded-none overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="font-serif text-xs font-bold text-brand-blue-primary line-clamp-1">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(index)}
                            className="text-brand-blue-sky hover:text-brand-pink-medium transition-colors p-0.5"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Attribute Badges */}
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <span className="text-[9px] font-mono uppercase text-brand-blue-sky">
                            Color: {item.selectedColor}
                          </span>
                          <span className="text-[9px] font-mono uppercase text-brand-pink-deep font-semibold">
                            Size: {item.selectedSize}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls & Price */}
                      <div className="flex items-center justify-between mt-2">
                        {/* Interactive Qty Stepper */}
                        <div className="flex items-center border border-brand-blue-primary/10 rounded-none overflow-hidden h-6 bg-white">
                          <button
                            onClick={() => item.quantity > 1 && handleQuantityChange(index, item.quantity - 1)}
                            className="px-1.5 text-brand-blue-sky hover:bg-slate-50 transition-colors cursor-pointer"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          
                          <span className="px-1.5 text-xs font-mono font-bold text-brand-blue-primary min-w-[16px] text-center">
                            {item.quantity}
                          </span>
                          
                          <button
                            onClick={() => handleQuantityChange(index, item.quantity + 1)}
                            className="px-1.5 text-brand-blue-sky hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Dynamic Subtotal per item */}
                        <span className="font-serif text-xs font-bold text-brand-blue-primary">
                          {formatNaira(item.product.price * item.quantity)}
                        </span>
                      </div>

                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer Summary Card */}
            {cartItems.length > 0 && (
              <div className="p-8 bg-brand-cream border-t border-brand-blue-primary/10 space-y-4">
                
                {/* Breakdowns */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-brand-blue-sky">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatNaira(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-brand-blue-sky">
                    <span>Shipping</span>
                    <span className="text-brand-pink-medium font-mono font-semibold">
                      {isFreeShipping ? "Free" : "₦5,000"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-brand-blue-primary border-t border-brand-blue-primary/10 pt-3 font-bold">
                    <span>Total</span>
                    <span className="font-serif text-base text-brand-blue-primary">
                      {formatNaira(isFreeShipping ? subtotal : subtotal + 5000)}
                    </span>
                  </div>
                </div>

                {/* Concierge checkout compilation launch */}
                <button
                  id="checkout-whats-btn"
                  onClick={onCheckout}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-brand-blue-primary hover:bg-white text-white hover:text-brand-blue-primary border border-brand-blue-primary rounded-none text-xs font-bold uppercase tracking-[0.1em] transition-all duration-300 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  Checkout via WhatsApp
                </button>

                <p className="text-[10px] text-brand-blue-sky/60 text-center leading-relaxed font-light">
                  Chat with our Concierge to finalize order
                </p>

              </div>
            )}

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
