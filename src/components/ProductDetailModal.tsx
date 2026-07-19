import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, ShieldCheck, Ruler, ShoppingBag, Check, ChevronDown, Sparkles } from 'lucide-react';
import { Product, Review } from '../types';
import { reviewsDatabase } from '../data/products';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToBag: (product: Product, color: string, size: string, qty: number) => void;
}

export default function ProductDetailModal({
  product,
  onClose,
  onAddToBag
}: ProductDetailModalProps) {
  if (!product) return null;

  const colors = product.colors && product.colors.length > 0 ? product.colors : ['Classic'];
  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['One Size Fits All'];

  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'features'>('details');
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  const getColorHex = (colorName: string): string => {
    const c = colorName.toLowerCase();
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

  const reviews: Review[] = reviewsDatabase[product.id] || [];

  const handleAddToBag = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    setIsAdding(true);

    setTimeout(() => {
      onAddToBag(product, selectedColor, selectedSize, quantity);
      setIsAdding(false);
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 2000);
    }, 600);
  };

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Luxury size guide data
  const sizeChart = [
    { size: 'XS', bust: '31-33"', waist: '24-25"', hips: '34-36"' },
    { size: 'S', bust: '33-35"', waist: '26-27"', hips: '36-38"' },
    { size: 'M', bust: '35-37"', waist: '28-29"', hips: '38-40"' },
    { size: 'L', bust: '37-39"', waist: '30-32"', hips: '40-42"' },
    { size: 'XL', bust: '39-41"', waist: '32-34"', hips: '42-44"' },
    { size: 'XXL', bust: '41-43"', waist: '34-36"', hips: '44-46"' },
    { size: '3XL', bust: '43-45"', waist: '36-38"', hips: '46-48"' }
  ];

  const isVideo = (url: string) => /\.(mp4|webm|ogg)$/i.test(url);

  return (
    <AnimatePresence>
      <div id="product-detail-modal-root" className="fixed inset-0 z-50 overflow-y-auto bg-brand-blue-primary/40 backdrop-blur-xs flex items-center justify-center p-4">
        
        {/* Backdrop closer clicker */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Modal Main Frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 5 }}
          className="relative w-full max-w-4xl bg-white rounded-none shadow-2xl z-10 flex flex-col md:flex-row max-h-[92vh] md:max-h-[85vh] lg:max-h-[80vh] overflow-y-auto md:overflow-hidden border border-brand-blue-primary/20 text-brand-blue-primary"
        >
          {/* Close Button top-right */}
          <button
            onClick={onClose}
            className="fixed md:absolute right-6 top-6 md:right-4 md:top-4 z-50 p-2 bg-brand-cream hover:bg-brand-pink-light text-brand-blue-primary rounded-none border border-brand-blue-primary/10 shadow-xs transition-all cursor-pointer"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Column: Image Gallery Module */}
          <div className="w-full md:w-1/2 p-5 md:p-8 bg-brand-cream flex flex-col gap-4 md:overflow-y-auto flex-shrink-0">
            {/* Active stage photo */}
            <div className="relative w-full aspect-[4/5] bg-brand-cream rounded-none overflow-hidden border border-brand-blue-primary/10">
              {isVideo(selectedImage) ? (
                <video
                  src={selectedImage}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
              )}
              {product.isBestSeller && (
                <div className="absolute bottom-3 left-3 bg-brand-blue-primary text-white border border-brand-pink-medium/30 text-[9px] font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-none shadow-md">
                  Best Seller
                </div>
              )}
            </div>

            {/* Thumbnail Row */}
            <div className="flex gap-3 justify-center">
              {product.images.map((img, idx) => {
                const isSelected = selectedImage === img;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-18 rounded-none overflow-hidden bg-brand-cream border transition-all ${
                      isSelected ? 'border-brand-pink-medium scale-102 ring-1 ring-brand-pink-light' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    {isVideo(img) ? (
                      <video
                        src={img}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Premium Guarantee note */}
            <div className="mt-2 p-3 bg-brand-pink-light/40 border-l-2 border-brand-pink-medium flex items-center gap-3">
              <p className="text-[10px] text-brand-pink-deep leading-relaxed font-semibold">
                Every Dr Bodyshaper garment is shipped in premium packaging.
              </p>
            </div>
          </div>

          {/* Right Column: Interaction & Buy Interface */}
          <div className="w-full md:w-1/2 p-5 md:p-8 md:overflow-y-auto flex flex-col text-left bg-white">
            
            {/* Category / SKU Tag */}
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono uppercase bg-brand-pink-light text-brand-pink-deep px-2.5 py-1 font-bold tracking-wider">
                {product.categoryLabel}
              </span>
              <span className="text-[9px] font-mono text-brand-blue-sky/70 tracking-wider">
                SKU: {product.sku}
              </span>
            </div>

            {/* Product Title */}
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-brand-blue-primary mt-3 leading-tight">
              {product.name}
            </h2>

            {/* Pricing Section (Always Visible for better UX) */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pb-4 border-b border-brand-blue-primary/5">
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl sm:text-3xl font-extrabold text-brand-blue-primary tracking-tight">
                  {formatNaira(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="font-serif text-base sm:text-lg text-brand-blue-sky/50 line-through">
                    {formatNaira(product.originalPrice)}
                  </span>
                )}
              </div>
              
              {/* Quick Status Badge */}
              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 text-[9px] font-mono uppercase font-bold tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                In Stock
              </div>
            </div>

            {/* Interactive Custom Tab System */}
            <div className="flex border-b border-brand-blue-primary/10 text-[10px] font-bold uppercase tracking-widest text-brand-blue-sky mt-4">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-2.5 px-3 border-b-2 transition-all flex-1 text-center cursor-pointer ${
                  activeTab === 'details' ? 'border-brand-pink-medium text-brand-blue-primary font-bold' : 'border-transparent hover:text-brand-blue-primary/80'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('features')}
                className={`py-2.5 px-3 border-b-2 transition-all flex-1 text-center cursor-pointer ${
                  activeTab === 'features' ? 'border-brand-pink-medium text-brand-blue-primary font-bold' : 'border-transparent hover:text-brand-blue-primary/80'
                }`}
              >
                Features & Fabric
              </button>
            </div>

            {/* Tabs content box */}
            <div className="py-4 text-xs text-brand-blue-sky leading-relaxed min-h-[90px]">
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <p className="text-slate-600 font-light leading-relaxed text-xs sm:text-sm">
                    {product.description}
                  </p>
                  
                  {/* Visual feature highlights for overview */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 bg-brand-cream/60 border border-brand-blue-primary/5 text-left">
                      <span className="block text-[8px] font-mono text-brand-pink-deep uppercase tracking-wider font-bold">Lagos Delivery</span>
                      <span className="text-[10px] font-semibold text-brand-blue-primary block mt-0.5">Complimentary over ₦150k</span>
                    </div>
                    <div className="p-2.5 bg-brand-cream/60 border border-brand-blue-primary/5 text-left">
                      <span className="block text-[8px] font-mono text-brand-pink-deep uppercase tracking-wider font-bold font-semibold">Luxury Fabric</span>
                      <span className="text-[10px] font-semibold text-brand-blue-primary block mt-0.5">Premium Sculpt / Pure Silk</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'features' && (
                <ul className="space-y-2 text-slate-600">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <span className="text-brand-pink-deep mt-1">•</span>
                      <span className="font-medium text-brand-blue-primary/90">{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Interactive Color Selection */}
            <div className="mt-2 space-y-2 text-left">
              <p className="text-[10px] font-bold text-brand-blue-primary uppercase tracking-wide">
                Select Color: <span className="font-normal font-mono text-brand-pink-deep">{selectedColor}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {colors.map((color) => {
                  const isSelected = selectedColor === color;
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`relative px-3 py-1.5 rounded-none border text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-brand-blue-primary text-white border-brand-blue-primary scale-102 font-bold'
                          : 'bg-white hover:bg-slate-50 text-brand-blue-sky border-brand-blue-primary/20'
                      }`}
                    >
                      <span 
                        className="w-2.5 h-2.5 rounded-full border border-slate-200 inline-block flex-shrink-0" 
                        style={{ backgroundColor: getColorHex(color) }}
                      />
                      <span>{color}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Size Selection & Size Guide */}
            <div className="mt-5 space-y-2.5">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                <span className={sizeError ? 'text-rose-600 animate-bounce' : 'text-brand-blue-primary'}>
                  Select Size {sizeError && ' * Required'}
                </span>
                
                {/* Size guide toggle */}
                <button
                  onClick={() => setShowSizeGuide(!showSizeGuide)}
                  className="flex items-center gap-1 text-brand-pink-deep hover:text-brand-pink-primary transition-colors text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5 text-brand-pink-primary" />
                  Size Guide
                </button>
              </div>

              {/* Error Validation Highlight */}
              {sizeError && (
                <p className="text-[10px] font-mono font-bold text-rose-600 bg-rose-50 p-2 border border-rose-100">
                  ⚠️ Please select a size before adding to cart.
                </p>
              )}

              {/* Sizing grid option buttons */}
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(size);
                        setSizeError(false);
                      }}
                      className={`h-9 min-w-[40px] px-3 rounded-none border text-xs font-mono font-bold cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-brand-pink-medium text-white border-brand-pink-medium scale-102'
                          : 'bg-white hover:bg-slate-50 text-brand-blue-sky border-brand-blue-primary/20'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              {/* Integrated Size Guide Dropdown Panel */}
              <AnimatePresence>
                {showSizeGuide && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden border border-brand-blue-primary/10 rounded-none bg-brand-pink-light/30 shadow-xs"
                  >
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif text-xs font-bold text-brand-blue-primary">
                          Size Chart
                        </h4>
                        <span className="text-[9px] font-mono text-brand-blue-sky uppercase tracking-widest">
                          Inches
                        </span>
                      </div>
                      
                      <table className="w-full text-left text-[11px]">
                        <thead>
                          <tr className="border-b border-brand-pink-medium/40 text-[9px] font-mono uppercase text-brand-blue-sky">
                            <th className="pb-1.5">Size</th>
                            <th className="pb-1.5">Bust</th>
                            <th className="pb-1.5">Waist</th>
                            <th className="pb-1.5">Hips</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-pink-medium/10 text-brand-blue-primary font-mono">
                          {sizeChart.map((row) => (
                            <tr
                              key={row.size}
                              className={`hover:bg-brand-pink-light/30 transition-colors ${
                                selectedSize === row.size ? 'bg-brand-pink-light/40 font-bold text-brand-pink-deep' : ''
                              }`}
                            >
                              <td className="py-1.5 font-bold">{row.size}</td>
                              <td className="py-1.5">{row.bust}</td>
                              <td className="py-1.5">{row.waist}</td>
                              <td className="py-1.5">{row.hips}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quantity Controls and Add to Bag Row */}
            <div className="mt-8 pt-5 border-t border-brand-blue-primary/10 flex items-end gap-4">
              
              {/* Quantity selectors */}
              <div className="flex flex-col space-y-1">
                <span className="text-[9px] font-mono uppercase text-brand-blue-sky tracking-wider">Quantity</span>
                <div className="flex items-center border border-brand-blue-primary/20 rounded-none h-11 bg-brand-cream overflow-hidden">
                  <button
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    className="px-3.5 h-full hover:bg-slate-200 text-brand-blue-primary transition-colors cursor-pointer"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-3 font-mono font-bold text-brand-blue-primary min-w-[24px] text-center text-xs">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3.5 h-full hover:bg-slate-200 text-brand-blue-primary transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to bag button with micro animations */}
              <div className="flex-1">
                <button
                  onClick={handleAddToBag}
                  disabled={isAdding || addSuccess}
                  className={`w-full h-11 rounded-none font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
                    addSuccess 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-brand-blue-primary hover:bg-white text-white hover:text-brand-blue-primary border border-brand-blue-primary'
                  }`}
                >
                  {isAdding ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : addSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      Added Successfully
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-white" />
                      Add to Bag
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  );
}
