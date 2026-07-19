import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Trash2, 
  MessageSquare, 
  ShieldCheck, 
  ArrowRight, 
  Info, 
  Instagram, 
  Check, 
  MapPin, 
  Gift,
  Heart,
  ChevronDown,
  ShoppingBag,
  Plus,
  Video,
  X,
  Home,
  Moon,
  Compass,
  Truck,
  Store
} from 'lucide-react';

import Header from './components/Header';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import ProductDetailModal from './components/ProductDetailModal';
import AdminPanel from './components/AdminPanel';
import AboutUs from './components/AboutUs';

import { products as defaultProducts } from './data/products';
import { Product, CartItem, SortOption } from './types';
import { compileWhatsAppCheckoutUrl, formatNairaValue } from './lib/checkout';
import { fetchProducts } from './lib/api';
import { getExtendedSizes } from './lib/sizes';

const categories = [
  { id: 'all', label: 'All Products' },
  { id: 'pajamas', label: 'Pajamas / Pyjamas' },
  { id: 'lingerie', label: 'Lingerie' },
  { id: 'activewear', label: 'Activewear' },
  { id: 'beachwear', label: 'Beachwear' },
  { id: 'new-arrivals', label: 'New Arrivals' },
  { id: 'best-sellers', label: 'Best Sellers' },
  { id: 'sale', label: 'Sale' }
];

export default function App() {
  // Application states
  const [currentPage, setCurrentPage] = useState<'home' | 'collection' | 'admin' | 'about'>('home');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  
  const [appProducts, setAppProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('dr_bodyshaper_products');
      const rawProducts = saved ? JSON.parse(saved) : defaultProducts;
      return rawProducts.map((p: Product) => ({ ...p, sizes: getExtendedSizes(p.sizes) }));
    } catch {
      return defaultProducts.map((p: Product) => ({ ...p, sizes: getExtendedSizes(p.sizes) }));
    }
  });

  // Supabase data fetch
  useEffect(() => {
    async function loadData() {
      const dbProducts = await fetchProducts();
      if (dbProducts && dbProducts.length > 0) {
        setAppProducts(dbProducts.map((p: Product) => ({ ...p, sizes: getExtendedSizes(p.sizes) })));
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem('dr_bodyshaper_products', JSON.stringify(appProducts));
  }, [appProducts]);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setCurrentPage('admin');
      } else {
        setCurrentPage((prev) => (prev === 'admin' ? 'home' : prev));
      }
    };
    
    // Check initial hash
    handleHashChange();
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Cart state persisted in localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dr_bodyshaper_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist state persisted in localStorage
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('dr_bodyshaper_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  
  // Checkout Inquiry draft preview modal state
  const [checkoutPreviewOpen, setCheckoutPreviewOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryLocation, setDeliveryLocation] = useState('Lagos Island');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem('dr_bodyshaper_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('dr_bodyshaper_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Handler: Add to shopping bag
  const handleAddToBag = (product: Product, color: string, size: string, quantity: number = 1) => {
    setCartItems((prevItems) => {
      // Check if exact same item (product, color, size) is already in the bag
      const existingIdx = prevItems.findIndex(
        (item) => 
          item.product.id === product.id && 
          item.selectedColor === color && 
          item.selectedSize === size
      );

      if (existingIdx > -1) {
        const updated = [...prevItems];
        updated[existingIdx].quantity += quantity;
        return updated;
      } else {
        return [...prevItems, { product, selectedColor: color, selectedSize: size, quantity }];
      }
    });

    // Provide luxury haptic response/auto open cart drawer for better UX
    setTimeout(() => {
      setCartDrawerOpen(true);
    }, 450);
  };

  // Handler: Remove item
  const handleRemoveItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Handler: Update quantity
  const handleUpdateQuantity = (index: number, newQty: number) => {
    setCartItems((prev) => {
      const updated = [...prev];
      updated[index].quantity = newQty;
      return updated;
    });
  };

  // Toggle wishlist item
  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  // Dynamically filter, search and sort products
  const filteredProducts = appProducts
    .filter((product) => {
      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return (
          product.name.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.categoryLabel.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      // Sorting
      if (sortOption === 'price-low-high') {
        return a.price - b.price;
      }
      if (sortOption === 'price-high-low') {
        return b.price - a.price;
      }
      if (sortOption === 'rating') {
        return b.rating - a.rating;
      }
      // newest (default)
      return b.isNew ? 1 : -1;
    });

  // Execute checkout compilation and redirect to WhatsApp
  const executeCheckout = () => {
    const userEmail = "faroukayomide33@gmail.com";
    
    // Build a custom message block which includes custom customer metadata
    let customEmailBlock = userEmail;
    if (customerName) {
      if (deliveryMethod === 'delivery') {
        customEmailBlock += ` (${customerName}, Option: Delivery to ${deliveryLocation})`;
      } else {
        customEmailBlock += ` (${customerName}, Option: Pickup in Shop)`;
      }
    }

    const whatsappUrl = compileWhatsAppCheckoutUrl({
      cartItems,
      userEmail: customEmailBlock,
      deliveryMethod,
      deliveryLocation: deliveryMethod === 'delivery' ? deliveryLocation : undefined,
      deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress : undefined
    });

    // Open link in new tab to route seamlessly
    window.open(whatsappUrl, '_blank');
    setCheckoutPreviewOpen(false);
  };

  // Smooth scroll to catalog section
  const scrollToCatalog = () => {
    const element = document.getElementById('shop-catalog-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Total cart items count
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div id="dr-bodyshaper-app" className="min-h-screen bg-brand-cream flex flex-col font-sans select-none selection:bg-brand-pink-soft selection:text-brand-pink-deep pb-16 md:pb-0">
      
      {/* Global Interactive Navigation Header */}
      <Header
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        searchQuery={searchQuery}
        setSearchQuery={(query) => {
          setSearchQuery(query);
          setCurrentPage('collection');
        }}
        selectedCategory={selectedCategory}
        setSelectedCategory={(cat) => {
          setSelectedCategory(cat);
          setCurrentPage('collection');
        }}
        cartCount={totalCartCount}
        onCartClick={() => setCartDrawerOpen(true)}
        wishlistCount={wishlist.length}
        onWishlistClick={() => setWishlistOpen(true)}
      />

      {/* Simple Shipping Text - Always visible below the header */}
      <div className="py-3 text-center bg-white border-b border-brand-blue-primary/5">
        <p className="text-[9px] sm:text-xs text-brand-blue-sky uppercase tracking-widest font-mono">
          Complimentary Shipping on Orders over <strong>₦150,000</strong> • Secured WhatsApp Checkout
        </p>
      </div>

      <AnimatePresence mode="wait">
        {currentPage === 'home' ? (
          <motion.div
            key="home-page"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col"
          >
            {/* Premium Haute Couture Hero Slide/Grid */}
            <Hero 
              products={appProducts}
              onExploreClick={() => {
                setSelectedCategory('all');
                setCurrentPage('collection');
              }}
              onViewProduct={(product) => setSelectedProductForModal(product)}
            />

            {/* Boutique Highlights Section */}
            <section className="py-16 bg-white border-y border-slate-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-2 mb-12">
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-pink-deep font-bold">
                    Highlights
                  </span>
                  <h2 className="font-serif text-3xl font-extrabold text-brand-blue-deep">
                    The Signature Essentials
                  </h2>
                  <p className="text-xs text-slate-500 max-w-md mx-auto font-light leading-relaxed">
                    Explore our sleepwear and body shapewear favorites.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                  {appProducts.slice(0, 4).map((product) => (
                    <div key={product.id} className="relative">
                      {/* Embedded interactive wishlist heart button directly in grid */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleWishlist(product);
                        }}
                        className="absolute top-2 sm:top-3 right-2 sm:right-3 z-15 p-1.5 sm:p-2.5 bg-brand-cream hover:bg-brand-pink-light border border-brand-blue-primary/10 rounded-none text-brand-blue-primary hover:text-rose-500 transition-all shadow-xs focus:outline-hidden cursor-pointer active:scale-95"
                        title={wishlist.some(item => item.id === product.id) ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart 
                          className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${wishlist.some(item => item.id === product.id) ? 'fill-rose-500 text-rose-500' : 'text-brand-blue-sky'}`} 
                        />
                      </button>

                      <ProductCard
                        product={product}
                        onViewDetails={(prod) => setSelectedProductForModal(prod)}
                        onQuickAdd={(prod, color, size) => handleAddToBag(prod, color, size, 1)}
                      />
                    </div>
                  ))}
                </div>

                <div className="text-center mt-12">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setCurrentPage('collection');
                    }}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-brand-blue-primary hover:bg-brand-pink-deep text-white border border-transparent font-semibold text-xs tracking-widest uppercase transition-all duration-300 cursor-pointer"
                  >
                    <span>View Full Catalogue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>

            {/* Lagos Boutique Experience Section */}
            <section className="py-16 bg-white border-b border-slate-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-brand-blue-primary text-white p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row gap-8 items-center justify-between">
                  {/* Background elements */}
                  <div className="absolute right-0 bottom-0 w-80 h-80 bg-brand-pink-deep/10 rounded-full blur-3xl -z-0" />
                  
                  <div className="text-left space-y-4 max-w-xl z-10">
                    <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-brand-pink-light font-bold">
                      Store Address
                    </span>
                    <h3 className="font-serif text-2xl md:text-3xl font-bold leading-tight">
                      Visit Our Store
                    </h3>
                    <p className="text-xs text-slate-200 font-light leading-relaxed">
                      Come for in-store pick-ups and consultations. We are easily accessible on Lagos Island.
                    </p>
                    <div className="flex flex-col gap-2 pt-2 text-xs text-brand-pink-light font-mono">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-brand-pink-medium flex-shrink-0" />
                        <span>Faith Plaza beside Dubai Mall, Breadfruit, Lagos, Nigeria</span>
                      </div>
                      <div>🕒 Hours: 8:30 AM - 7:00 PM Daily</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto z-10">
                    <a 
                      href="https://wa.me/2348066398259"
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-3.5 bg-brand-pink-medium hover:bg-brand-pink-deep text-white text-xs font-bold uppercase tracking-widest text-center transition-colors font-mono"
                    >
                      Chat Boutique WhatsApp
                    </a>
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setCurrentPage('collection');
                      }}
                      className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold uppercase tracking-widest text-center transition-colors cursor-pointer font-mono"
                    >
                      Shop Catalogue
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </motion.div>
        ) : currentPage === 'collection' ? (
          <motion.main
            key="collection-page"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            id="shop-catalog-section"
            className="flex-1 py-16 bg-white border-y border-slate-100"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              {/* Section Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-100">
                <div className="text-left space-y-1">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-pink-deep font-bold">
                    Collection
                  </span>
                  <h2 className="font-serif text-3xl font-extrabold text-brand-blue-deep">
                    {selectedCategory === 'all' && 'The Complete Catalogue'}
                    {selectedCategory === 'pajamas' && 'Pajamas'}
                    {selectedCategory === 'activewear' && 'Activewear'}
                    {selectedCategory === 'beachwear' && 'Beachwear'}
                    {selectedCategory === 'lingerie' && 'Lingerie'}
                    {selectedCategory === 'new-arrivals' && 'New Arrivals'}
                    {selectedCategory === 'best-sellers' && 'Best Sellers'}
                    {selectedCategory === 'sale' && 'Sale'}
                  </h2>
                  <p className="text-xs text-slate-500 font-light">
                    Showing <strong className="text-slate-800">{filteredProducts.length}</strong> items.
                  </p>
                </div>

                {/* Sorting controls & filters */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-mono text-brand-blue-sky/80 uppercase tracking-wider">Sort By:</span>
                  
                  <div className="relative inline-block text-left">
                    <select
                      id="sort-select-menu"
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as SortOption)}
                      className="appearance-none bg-brand-cream hover:bg-brand-pink-light/30 border border-brand-blue-primary/10 text-[11px] font-bold uppercase tracking-widest text-brand-blue-primary px-4 py-2.5 pr-8 rounded-none focus:outline-hidden cursor-pointer transition-colors"
                    >
                      <option value="newest">Newest Arrivals</option>
                      <option value="price-low-high">Price: Low to High</option>
                      <option value="price-high-low">Price: High to Low</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-brand-blue-primary absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Clear filters shortcut */}
                  {(selectedCategory !== 'all' || searchQuery !== '') && (
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setSearchQuery('');
                      }}
                      className="text-xs font-mono text-brand-pink-deep hover:text-brand-pink-primary font-bold transition-colors underline tracking-wider cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Horizontal Category Pill Filter (Shop Categories) */}
              <div className="mt-8 flex gap-2 overflow-x-auto no-scrollbar pb-3 scroll-smooth border-b border-brand-blue-primary/5">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex-shrink-0 px-4 py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'bg-brand-pink-primary text-white font-bold'
                          : 'bg-brand-cream hover:bg-brand-pink-light/30 text-brand-blue-primary border border-brand-blue-primary/5 hover:border-brand-blue-primary/10'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Product Cards Interactive Grid */}
              <div className="mt-12">
                {filteredProducts.length === 0 ? (
                  <div className="py-20 text-center max-w-md mx-auto space-y-4">
                    <div className="p-5 bg-brand-pink-light/40 rounded-full inline-block text-brand-pink-primary">
                      <Info className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-serif text-lg font-bold text-brand-blue-deep">No Items Found</h3>
                      <p className="text-xs text-slate-500 font-light leading-relaxed">
                        No items matched your search filters. Try resetting the search filters.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setSearchQuery('');
                      }}
                      className="px-5 py-2.5 bg-brand-blue-deep hover:bg-brand-pink-deep text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-colors cursor-pointer"
                    >
                      Reset Search
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                    {filteredProducts.map((product) => (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="relative"
                      >
                        {/* Embedded interactive wishlist heart button directly in grid */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleWishlist(product);
                          }}
                          className="absolute top-2 sm:top-3 right-2 sm:right-3 z-15 p-1.5 sm:p-2.5 bg-brand-cream hover:bg-brand-pink-light border border-brand-blue-primary/10 rounded-none text-brand-blue-primary hover:text-rose-500 transition-all shadow-xs focus:outline-hidden cursor-pointer active:scale-95"
                          title={wishlist.some(item => item.id === product.id) ? "Remove from wishlist" : "Add to wishlist"}
                        >
                          <Heart 
                            className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${wishlist.some(item => item.id === product.id) ? 'fill-rose-500 text-rose-500' : 'text-brand-blue-sky'}`} 
                          />
                        </button>

                        <ProductCard
                          product={product}
                          onViewDetails={(prod) => setSelectedProductForModal(prod)}
                          onQuickAdd={(prod, color, size) => handleAddToBag(prod, color, size, 1)}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </motion.main>
        ) : currentPage === 'admin' ? (
          <motion.div
            key="admin-page"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex-1 bg-white"
          >
            <AdminPanel products={appProducts} setProducts={setAppProducts} />
          </motion.div>
        ) : currentPage === 'about' ? (
          <motion.div
            key="about-page"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            <AboutUs />
          </motion.div>
        ) : null}
      </AnimatePresence>
      {/* Slide-out Shopping Bag Cart Drawer */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => {
          setCartDrawerOpen(false);
          setCheckoutPreviewOpen(true);
        }}
      />

      {/* Wishlist Drawer/Modal Overlay */}
      <AnimatePresence>
        {wishlistOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setWishlistOpen(false)}
              className="fixed inset-0 z-50 bg-black/50"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-full max-w-sm bg-brand-cream border-r border-brand-blue-primary/20 shadow-2xl flex flex-col h-full text-left"
            >
              <div className="p-6 border-b border-brand-blue-primary/10 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-brand-pink-medium fill-current" />
                  <h2 className="font-serif text-base font-bold text-brand-blue-primary">My Boutique Wishlist ({wishlist.length})</h2>
                </div>
                <button
                  onClick={() => setWishlistOpen(false)}
                  className="p-1 text-brand-blue-sky hover:text-brand-pink-deep rounded-none hover:bg-brand-cream border border-brand-blue-primary/10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {wishlist.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                    <Heart className="w-8 h-8 text-brand-pink-medium/30" />
                    <p className="text-xs text-brand-blue-sky font-light">Your wishlist is empty. Tap the heart on products to save them here.</p>
                  </div>
                ) : (
                  wishlist.map((product) => (
                    <div key={product.id} className="flex gap-4 p-3 bg-white border border-brand-blue-primary/10 rounded-none relative group">
                      <img src={product.images[0]} alt={product.name} className="w-16 h-20 object-cover rounded-none border border-brand-blue-primary/10" referrerPolicy="no-referrer" />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-serif text-xs font-bold text-brand-blue-primary line-clamp-1">{product.name}</h4>
                          <span className="text-[10px] font-mono font-bold text-brand-pink-deep block mt-0.5">{formatNairaValue(product.price)}</span>
                        </div>
                        <button
                          onClick={() => {
                            handleAddToBag(product, product.colors[0], product.sizes[0], 1);
                            setWishlistOpen(false);
                          }}
                          className="w-full py-1.5 bg-brand-pink-light hover:bg-brand-pink-medium text-brand-pink-deep hover:text-white rounded-none text-[9px] font-bold uppercase tracking-widest transition-colors mt-2"
                        >
                          Quick Add
                        </button>
                      </div>
                      <button
                        onClick={() => handleToggleWishlist(product)}
                        className="absolute top-2 right-2 text-brand-pink-medium hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* High-Fidelity Product Detail View Modal */}
      <ProductDetailModal
        product={selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
        onAddToBag={handleAddToBag}
      />

      {/* Real-time WhatsApp Checkout Concierge Inquiry Compiler Overlay */}
      <AnimatePresence>
        {checkoutPreviewOpen && (
          <div id="checkout-compiler-overlay" className="fixed inset-0 z-50 bg-brand-blue-primary/30 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={() => setCheckoutPreviewOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="relative w-full max-w-xl bg-white rounded-none border border-brand-blue-primary/15 shadow-2xl z-10 p-6 sm:p-8 text-left space-y-6 text-brand-blue-primary"
            >
              <div className="flex items-center justify-between border-b border-dotted border-brand-pink-medium pb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-brand-pink-medium" />
                  <h3 className="font-serif text-base font-bold text-brand-blue-primary">
                    WhatsApp Concierge Checkout Draft
                  </h3>
                </div>
                <button
                  onClick={() => setCheckoutPreviewOpen(false)}
                  className="p-1.5 rounded-none hover:bg-brand-cream border border-brand-blue-primary/10 text-brand-blue-sky cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Personalization & Delivery preference selection */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase text-brand-blue-sky font-bold block">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chioma Adebayo"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-none border border-brand-blue-primary/15 bg-brand-cream focus:bg-white focus:outline-hidden outline-hidden font-bold text-brand-blue-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase text-brand-blue-sky font-bold block">
                      Delivery Option
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('delivery')}
                        className={`flex items-center justify-center gap-1.5 py-1.5 px-3 text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                          deliveryMethod === 'delivery'
                            ? 'bg-brand-blue-primary text-white border-brand-blue-primary font-bold'
                            : 'bg-brand-cream text-brand-blue-sky border-brand-blue-primary/10 hover:bg-white'
                        }`}
                      >
                        <Truck className="w-3.5 h-3.5" /> Delivery
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('pickup')}
                        className={`flex items-center justify-center gap-1.5 py-1.5 px-3 text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                          deliveryMethod === 'pickup'
                            ? 'bg-brand-blue-primary text-white border-brand-blue-primary font-bold'
                            : 'bg-brand-cream text-brand-blue-sky border-brand-blue-primary/10 hover:bg-white'
                        }`}
                      >
                        <Store className="w-3.5 h-3.5" /> Shop Pickup
                      </button>
                    </div>
                  </div>
                </div>

                {/* Conditional fields based on selected preference */}
                {deliveryMethod === 'delivery' ? (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1"
                  >
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono uppercase text-brand-blue-sky font-bold block">
                        Delivery Region / State
                      </label>
                      <select
                        value={deliveryLocation}
                        onChange={(e) => setDeliveryLocation(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-none border border-brand-blue-primary/15 bg-brand-cream focus:bg-white focus:outline-hidden outline-hidden cursor-pointer font-bold text-brand-blue-primary"
                      >
                        <option value="Lagos Island">Lagos Island (Ikoyi, VI, Lekki, Chevron)</option>
                        <option value="Lagos Mainland">Lagos Mainland (Ikeja, Surulere, Yaba, Gbagada)</option>
                        <option value="Abuja FCT">Abuja FCT (Maitama, Wuse, Garki)</option>
                        <option value="Port Harcourt">Port Harcourt City</option>
                        <option value="Other Nigerian State">Other Nigerian State (FedEx Courier)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono uppercase text-brand-pink-deep font-bold block flex justify-between">
                        <span>Write Delivery Address *</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 15 Admiralty Way, Lekki Phase 1, Lagos"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-none border border-brand-blue-primary/15 bg-brand-cream focus:bg-white focus:outline-hidden outline-hidden font-bold text-brand-blue-primary placeholder:text-brand-blue-sky/40"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-brand-pink-light/45 border border-brand-pink-medium/15 p-3 text-xs text-brand-blue-primary flex items-start gap-3"
                  >
                    <MapPin className="w-4 h-4 text-brand-pink-primary shrink-0 mt-0.5" />
                    <div className="space-y-0.5 text-left">
                      <p className="font-bold uppercase tracking-wider text-[10px] text-brand-pink-deep">
                        Complimentary Flagship Store Pickup
                      </p>
                      <p className="text-[10.5px] leading-relaxed text-brand-blue-sky/85 font-light">
                        Pre-packaged and waiting for you at our high-end concierge lounge. No delivery fees apply.
                      </p>
                      <p className="text-[10px] font-mono font-bold mt-1 text-brand-blue-primary">
                        📍 Dr Bodyshaper Boutique Headquarters, VI, Lagos, Nigeria.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Live Preview of formatted Inquiry block */}
              <div className="space-y-1.5">
                <p className="text-[9px] font-mono uppercase text-brand-blue-sky font-bold">
                  Formatted Draft Message (Includes Photo URLs):
                </p>
                
                <div className="bg-brand-cream p-4 rounded-none border border-dotted border-brand-pink-medium/60 max-h-[220px] overflow-y-auto font-mono text-[10px] text-brand-blue-primary whitespace-pre-wrap leading-relaxed">
                  {`✦ DR BODYSHAPER BOUTIQUE LUXURY ORDER ✦\n`}
                  {`===================================\n\n`}
                  {`Hello Dr Bodyshaper Concierge,\n\n`}
                  {`I would like to place an order for the following luxury garments:\n\n`}
                  {cartItems.map((item, index) => {
                    const itemSub = item.product.price * item.quantity;
                    const primaryMedia = item.product.images?.[0] || '';
                    return (
                      `${index + 1}. ${item.product.name.toUpperCase()}\n` +
                      `   • SKU: ${item.product.sku}\n` +
                      `   • Selected Color: ${item.selectedColor}\n` +
                      `   • Selected Size: ${item.selectedSize}\n` +
                      `   • Quantity: ${item.quantity}\n` +
                      `   • Unit Price: ${formatNairaValue(item.product.price)}\n` +
                      `   • Item Subtotal: ${formatNairaValue(itemSub)}\n` +
                      (primaryMedia ? `   • Product Photo: ${primaryMedia}\n` : '') +
                      `\n`
                    );
                  }).join('')}
                  {`===================================\n`}
                  {`Order Subtotal: ${formatNairaValue(cartItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0))}\n`}
                  {`Delivery Option: ${deliveryMethod === 'pickup' ? 'PICKUP IN SHOP (Complimentary)' : 'DELIVERY TO ADDRESS'}\n`}
                  {deliveryMethod === 'delivery' ? (
                    `Delivery Region: ${deliveryLocation}\n` +
                    `Delivery Address: ${deliveryAddress || 'No address specified'}\n` +
                    `Delivery Fee: ${cartItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0) >= 150000 ? 'FREE (COMPLIMENTARY PROMO)' : '₦5,000'}\n`
                  ) : (
                    `Pickup Location: Dr Bodyshaper Flagship Store, Lagos, Nigeria\n` +
                    `Delivery Fee: FREE (SHOP PICKUP)\n`
                  )}
                  {`-----------------------------------\n`}
                  {`ESTIMATED GRAND TOTAL: ${formatNairaValue(
                    cartItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0) + 
                    (deliveryMethod === 'pickup' || cartItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0) >= 150000 ? 0 : 5000)
                  )}\n`}
                  {`===================================\n\n`}
                  {`Customer Info: faroukayomide33@gmail.com${customerName ? ` (${customerName}, Option: ${deliveryMethod === 'delivery' ? `Delivery to ${deliveryLocation}` : 'Pickup in Shop'})` : ''}\n`}
                  {`Session Timestamp: ${new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })} (Lagos Time)\n\n`}
                  {`Please confirm item availability, bespoke fitting options, and dispatch window. Thank you!`}
                </div>
              </div>

              {/* Trigger button */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => setCheckoutPreviewOpen(false)}
                  className="flex-1 py-3 text-brand-blue-primary hover:bg-brand-cream rounded-none text-xs font-bold uppercase border border-brand-blue-primary/20 transition-colors cursor-pointer"
                >
                  Edit My Bag
                </button>
                
                <button
                  onClick={executeCheckout}
                  disabled={deliveryMethod === 'delivery' && !deliveryAddress.trim()}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-white rounded-none text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    deliveryMethod === 'delivery' && !deliveryAddress.trim()
                      ? 'bg-slate-300 border-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                      : 'bg-brand-blue-primary hover:bg-brand-pink-medium hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-white" />
                  Launch WhatsApp Support
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Haute Couture Footer */}
      <footer id="boutique-footer" className="bg-brand-blue-deep text-white border-t border-brand-pink-soft/10 py-16 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            <div className="space-y-4 col-span-1 md:col-span-2">
              <span className="font-serif text-xl font-extrabold text-white flex items-center gap-1.5">
                Dr Bodyshaper
                <Sparkles className="w-4 h-4 text-brand-pink-primary" />
              </span>
              <p className="text-xs text-slate-400 font-light max-w-sm leading-relaxed">
                The premier luxury boutique in Nigeria specializing in medical-grade body-sculpting shapewear, luxurious pure silk sleepwear, and breathtaking resort attire. Redefining modern confidence with elite customer support.
              </p>
              <div className="flex gap-3 pt-2">
                <a href="https://www.instagram.com/dr_bodyshaper" target="_blank" rel="noreferrer" className="p-2 bg-white/5 hover:bg-brand-pink-deep text-slate-300 hover:text-white rounded-lg transition-colors" title="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://www.tiktok.com/@doctorbodyshaper?is_from_webapp=1&sender_device=pc" target="_blank" rel="noreferrer" className="p-2 bg-white/5 hover:bg-brand-pink-deep text-slate-300 hover:text-white rounded-lg transition-colors flex items-center gap-1.5" title="TikTok">
                  <Video className="w-4 h-4" />
                  <span className="text-[10px] font-mono tracking-wider">TikTok</span>
                </a>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-mono text-xs uppercase text-brand-pink-soft font-bold tracking-widest">
                Our Collections
              </h4>
              <ul className="space-y-2 text-xs text-slate-400 font-light">
                <li><button onClick={() => { setSelectedCategory('pajamas'); scrollToCatalog(); }} className="hover:text-brand-pink-primary transition-colors cursor-pointer">Pajamas</button></li>
                <li><button onClick={() => { setSelectedCategory('activewear'); scrollToCatalog(); }} className="hover:text-brand-pink-primary transition-colors cursor-pointer">Activewear</button></li>
                <li><button onClick={() => { setSelectedCategory('beachwear'); scrollToCatalog(); }} className="hover:text-brand-pink-primary transition-colors cursor-pointer">Beachwear</button></li>
                <li><button onClick={() => { setSelectedCategory('lingerie'); scrollToCatalog(); }} className="hover:text-brand-pink-primary transition-colors cursor-pointer">Lingerie</button></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-mono text-xs uppercase text-brand-pink-soft font-bold tracking-widest">
                Contact Us
              </h4>
              <ul className="space-y-2 text-xs text-slate-400 font-light">
                <li className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-brand-pink-primary flex-shrink-0 mt-0.5" />
                  <span>Faith Plaza beside Dubai Mall, Breadfruit, Lagos, Nigeria</span>
                </li>
                <li>
                  Daily Dispatch: 9:00 AM - 6:00 PM
                </li>
                <li>
                  Email Support: faroukayomide33@gmail.com
                </li>
                <li className="text-brand-pink-medium font-semibold">
                  📞 +234 806 639 8259
                </li>
              </ul>
            </div>

          </div>

          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 font-mono">
            <p>© 2026 drbodyshaper. All Rights Reserved.</p>
            <div className="flex gap-4">
              <span>Standard Packaging ✓</span>
              <span>Secure Checkout Guaranteed ✓</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar - App style */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-brand-blue-primary/10 py-2.5 px-3 z-40 md:hidden flex justify-around items-center shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        
        {/* Home Tab */}
        <button 
          onClick={() => setCurrentPage('home')}
          className={`flex flex-col items-center gap-1 flex-1 py-1 cursor-pointer transition-colors ${
            currentPage === 'home' ? 'text-brand-pink-deep font-bold' : 'text-brand-blue-sky hover:text-brand-blue-primary'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px] font-semibold uppercase tracking-wider font-sans">Home</span>
        </button>

        {/* Shop Tab */}
        <button 
          onClick={() => {
            setCurrentPage('collection');
          }}
          className={`flex flex-col items-center gap-1 flex-1 py-1 cursor-pointer transition-colors ${
            currentPage === 'collection' ? 'text-brand-pink-deep font-bold' : 'text-brand-blue-sky hover:text-brand-blue-primary'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[9px] font-semibold uppercase tracking-wider font-sans">Shop</span>
        </button>

        {/* Wishlist Tab */}
        <button 
          onClick={() => setWishlistOpen(true)}
          className="flex flex-col items-center gap-1 flex-1 py-1 cursor-pointer text-brand-blue-sky hover:text-brand-blue-primary relative"
        >
          <div className="relative">
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-pink-medium text-[8px] font-mono font-bold text-white ring-1 ring-white">
                {wishlist.length}
              </span>
            )}
          </div>
          <span className="text-[9px] font-semibold uppercase tracking-wider font-sans">Wishlist</span>
        </button>

        {/* Cart Tab */}
        <button 
          onClick={() => setCartDrawerOpen(true)}
          className="flex flex-col items-center gap-1 flex-1 py-1 cursor-pointer text-brand-blue-sky hover:text-brand-blue-primary relative"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-pink-medium text-[8px] font-mono font-bold text-white ring-1 ring-white">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </div>
          <span className="text-[9px] font-semibold uppercase tracking-wider font-sans">Bag</span>
        </button>

      </div>

    </div>
  );
}
