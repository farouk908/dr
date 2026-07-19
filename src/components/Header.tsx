import { useEffect } from 'react';
import { motion, useAnimation } from 'motion/react';
import { Search, ShoppingBag, Heart, ChevronDown } from 'lucide-react';

interface HeaderProps {
  currentPage: 'home' | 'collection' | 'admin' | 'about';
  setCurrentPage: (page: 'home' | 'collection' | 'admin' | 'about') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  cartCount: number;
  onCartClick: () => void;
  onWishlistClick?: () => void;
  wishlistCount: number;
}

export default function Header({
  currentPage,
  setCurrentPage,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  cartCount,
  onCartClick,
  onWishlistClick,
  wishlistCount
}: HeaderProps) {
  const controls = useAnimation();

  // Trigger bounce on cart count change
  useEffect(() => {
    if (cartCount > 0) {
      controls.start({
        scale: [1, 1.3, 0.95, 1.05, 1],
        transition: { duration: 0.5, ease: 'easeOut' }
      });
    }
  }, [cartCount, controls]);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'pajamas', label: 'Pajamas' },
    { id: 'activewear', label: 'Activewear' },
    { id: 'beachwear', label: 'Beachwear' },
    { id: 'lingerie', label: 'Lingerie' },
    { id: 'new-arrivals', label: 'New Arrivals' },
    { id: 'best-sellers', label: 'Best Sellers' },
    { id: 'sale', label: 'Sale' }
  ];

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-brand-pink-primary backdrop-blur-md border-b border-brand-pink-deep transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo - Name is only drbodyshaper (without boutique references) */}
          <div className="flex-shrink-0 flex items-center">
            <a 
              href="/" 
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage('home');
              }} 
              className="flex flex-col items-start select-none cursor-pointer"
            >
              <span className="font-serif text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-1 lowercase">
                drbodyshaper
              </span>
            </a>
          </div>

          {/* Laptop & Desktop Navigation Header Links */}
          <nav className="hidden md:flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage('home')}
              className={`relative px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                currentPage === 'home'
                  ? 'text-white font-bold border-b-2 border-white'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Home
            </button>
            <div className="h-3 w-px bg-white/20 mx-1" />
            
            {/* Shop Dropdown Trigger & Options */}
            <div className="relative group py-2">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setCurrentPage('collection');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                  currentPage === 'collection'
                    ? 'text-white font-bold border-b-2 border-white'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <span>Shop</span>
                <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
              </button>
              
              {/* Dropdown Menu Overlay */}
              <div className="absolute left-0 mt-1 w-44 bg-white shadow-xl py-1.5 border border-brand-pink-medium/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform translate-y-1 group-hover:translate-y-0">
                {categories.map((cat) => {
                  const isActive = currentPage === 'collection' && selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setCurrentPage('collection');
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-semibold tracking-wide uppercase transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-brand-pink-light/60 text-brand-pink-deep font-bold'
                          : 'text-brand-blue-primary hover:bg-brand-cream/80'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-3 w-px bg-white/20 mx-1" />
            <button
              onClick={() => setCurrentPage('about')}
              className={`relative px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                currentPage === 'about'
                  ? 'text-white font-bold border-b-2 border-white'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              About Us
            </button>
          </nav>

          {/* Search Bar & Action Buttons */}
          <div className="flex items-center gap-3 flex-1 max-w-xs md:max-w-sm justify-end">
            
            {/* Search Input Box */}
            <div className="relative w-full max-w-[140px] sm:max-w-[200px]">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-brand-blue-primary/50">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                id="product-search-input"
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-none border border-transparent text-xs bg-white focus:outline-hidden focus:border-white transition-all duration-200"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-medium hover:text-brand-pink-deep text-brand-blue-primary"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Wishlist Indicator */}
            {onWishlistClick && (
              <button
                onClick={onWishlistClick}
                className="relative p-2 text-white hover:text-white/80 transition-colors focus:outline-hidden"
                aria-label="View Wishlist"
              >
                <Heart className="w-4.5 h-4.5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[8px] font-mono font-bold text-brand-pink-primary ring-2 ring-brand-pink-primary">
                    {wishlistCount}
                  </span>
                )}
              </button>
            )}

            {/* Shopping Bag Icon with Count */}
            <button
              id="shopping-bag-btn"
              onClick={onCartClick}
              className="relative p-2 bg-white hover:bg-white/90 text-brand-pink-primary transition-all duration-300 flex items-center justify-center rounded-none"
              aria-label="Open Shopping Cart"
            >
              <motion.div animate={controls}>
                <ShoppingBag className="w-4 h-4" />
              </motion.div>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-none bg-brand-blue-primary text-[9px] font-mono font-bold text-white ring-1 ring-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
