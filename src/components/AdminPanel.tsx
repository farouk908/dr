import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Save, 
  Upload, 
  Loader, 
  Image as ImageIcon, 
  Film as FilmIcon, 
  Check, 
  Sparkles, 
  FileText, 
  Coins, 
  Tag, 
  Ruler, 
  Palette,
  Lock,
  Unlock,
  Key,
  LogOut,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';
import { upsertProduct, deleteProduct, uploadMedia } from '../lib/api';
import { getExtendedSizes } from '../lib/sizes';
import { Product } from '../types';

interface AdminPanelProps {
  products: Product[];
  setProducts: (products: Product[]) => void;
}

export default function AdminPanel({ products, setProducts }: AdminPanelProps) {
  // Security & Authentication States
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem('dr_bodyshaper_admin_logged_in') === 'true';
  });
  const [passcodeInput, setPasscodeInput] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [shakeLogin, setShakeLogin] = useState(false);

  // Passcode Changing States
  const [showChangePasscodeModal, setShowChangePasscodeModal] = useState(false);
  const [changePasscodeData, setChangePasscodeData] = useState({
    currentPasscode: '',
    newPasscode: '',
    confirmNewPasscode: ''
  });
  const [changePasscodeError, setChangePasscodeError] = useState('');
  const [changePasscodeSuccess, setChangePasscodeSuccess] = useState(false);

  // Standard Catalog management states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [newFeatureText, setNewFeatureText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Authentication Handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentSecurePasscode = localStorage.getItem('dr_bodyshaper_admin_passcode') || 'admin2026';
    
    if (passcodeInput === currentSecurePasscode) {
      setIsLoggedIn(true);
      sessionStorage.setItem('dr_bodyshaper_admin_logged_in', 'true');
      setLoginError('');
      setPasscodeInput('');
    } else {
      setLoginError('Invalid Administrator Passcode. Please try again.');
      setShakeLogin(true);
      setTimeout(() => setShakeLogin(false), 600);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('dr_bodyshaper_admin_logged_in');
  };

  const submitChangePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    const currentSecurePasscode = localStorage.getItem('dr_bodyshaper_admin_passcode') || 'admin2026';

    if (changePasscodeData.currentPasscode !== currentSecurePasscode) {
      setChangePasscodeError('Current passcode is incorrect.');
      setChangePasscodeSuccess(false);
      return;
    }

    if (changePasscodeData.newPasscode.length < 4) {
      setChangePasscodeError('New passcode must be at least 4 characters long.');
      setChangePasscodeSuccess(false);
      return;
    }

    if (changePasscodeData.newPasscode !== changePasscodeData.confirmNewPasscode) {
      setChangePasscodeError('New passcodes do not match.');
      setChangePasscodeSuccess(false);
      return;
    }

    // Save and reset
    localStorage.setItem('dr_bodyshaper_admin_passcode', changePasscodeData.newPasscode);
    setChangePasscodeSuccess(true);
    setChangePasscodeError('');
    setChangePasscodeData({
      currentPasscode: '',
      newPasscode: '',
      confirmNewPasscode: ''
    });

    setTimeout(() => {
      setShowChangePasscodeModal(false);
      setChangePasscodeSuccess(false);
    }, 1500);
  };

  // Constants
  const sizePresets = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL', '6XL', '7XL'];
  const colorPresets = [
    'Blue',
    'Light Blue',
    'Pink',
    'Light Pink',
    'Black',
    'White',
    'Red',
    'Green',
    'Beige',
    'Brown'
  ];
  const categoryPresets = [
    { id: 'pajamas', label: 'Pajamas / Pyjamas' },
    { id: 'lingerie', label: 'Lingerie' },
    { id: 'activewear', label: 'Activewear' },
    { id: 'beachwear', label: 'Beachwear' },
    { id: 'shapewear', label: 'Shapewear' }
  ];

  // Helper to detect if media is a video
  const isVideo = (url: string) => {
    if (!url) return false;
    return (
      url.includes('.mp4') || 
      url.includes('.webm') || 
      url.includes('.mov') || 
      url.startsWith('data:video/')
    );
  };

  // Upload handlers
  const handleFiles = async (files: FileList) => {
    setIsUploading(true);
    const newUrls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const url = await uploadMedia(files[i]);
      if (url) {
        newUrls.push(url);
      }
    }

    if (newUrls.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...newUrls]
      }));
    }
    setIsUploading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await handleFiles(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFiles(e.dataTransfer.files);
    }
  };

  // Remove a single uploaded file
  const removeImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({ ...product });
    setNewFeatureText('');
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      alert('Product name is required');
      return;
    }
    if (!formData.price || formData.price <= 0) {
      alert('Product price must be a valid number greater than 0');
      return;
    }

    setIsSaving(true);
    let updatedProducts = [...products];
    
    // Auto-generate SKU if missing
    const finalSku = formData.sku?.trim() || `SKU-${Math.floor(Math.random() * 89999 + 10000)}`;
    const finalCategory = formData.category || 'shapewear';
    const finalCategoryLabel = categoryPresets.find(c => c.id === finalCategory)?.label || 'Shapewear';

    if (editingId === 'new') {
      const finalSizes = formData.sizes ? getExtendedSizes(formData.sizes) : [];
      const newProduct = {
        ...formData,
        id: crypto.randomUUID(),
        sku: finalSku,
        category: finalCategory,
        categoryLabel: finalCategoryLabel,
        images: formData.images && formData.images.length > 0 ? formData.images : ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop'],
        sizes: finalSizes,
        colors: formData.colors && formData.colors.length > 0 ? formData.colors : ['Classic Black'],
        features: formData.features && formData.features.length > 0 ? formData.features : ['Seamless luxury sculpt design', 'Ultra comfort and breathable materials'],
        rating: formData.rating || 5,
        reviewsCount: formData.reviewsCount || 0,
        isBestSeller: formData.isBestSeller || false,
        isNew: formData.isNew !== undefined ? formData.isNew : true
      } as Product;
      
      updatedProducts = [newProduct, ...products];
      await upsertProduct(newProduct);
    } else {
      const finalSizes = formData.sizes ? getExtendedSizes(formData.sizes) : [];
      const updatedProduct = { 
        ...products.find(p => p.id === editingId), 
        ...formData, 
        sku: finalSku,
        category: finalCategory,
        categoryLabel: finalCategoryLabel,
        sizes: finalSizes 
      } as Product;
      updatedProducts = products.map(p => p.id === editingId ? updatedProduct : p);
      await upsertProduct(updatedProduct);
    }
    
    setProducts(updatedProducts);
    setEditingId(null);
    setFormData({});
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product? All reviews and data will be removed.')) {
      await deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleAddNew = () => {
    setEditingId('new');
    setFormData({
      name: '',
      price: 0,
      originalPrice: 0,
      description: '',
      category: 'pajamas',
      categoryLabel: 'Pajamas / Pyjamas',
      badge: 'New',
      sku: 'SKU-' + Math.floor(Math.random() * 89999 + 10000),
      images: [],
      colors: ['Classic Black'],
      sizes: ['S', 'M', 'L', 'XL'],
      features: ['Luxury fabrics and meticulous tailoring', 'Engineered for shape and long-lasting elegance']
    });
    setNewFeatureText('');
  };

  // Preset Toggles
  const toggleSizePreset = (size: string) => {
    const currentSizes = formData.sizes || [];
    if (currentSizes.includes(size)) {
      setFormData({
        ...formData,
        sizes: currentSizes.filter(s => s !== size)
      });
    } else {
      setFormData({
        ...formData,
        sizes: [...currentSizes, size]
      });
    }
  };

  const toggleColorPreset = (color: string) => {
    const currentColors = formData.colors || [];
    if (currentColors.includes(color)) {
      setFormData({
        ...formData,
        colors: currentColors.filter(c => c !== color)
      });
    } else {
      setFormData({
        ...formData,
        colors: [...currentColors, color]
      });
    }
  };

  const addFeature = () => {
    if (!newFeatureText.trim()) return;
    const currentFeatures = formData.features || [];
    setFormData({
      ...formData,
      features: [...currentFeatures, newFeatureText.trim()]
    });
    setNewFeatureText('');
  };

  const removeFeature = (idx: number) => {
    const currentFeatures = formData.features || [];
    setFormData({
      ...formData,
      features: currentFeatures.filter((_, i) => i !== idx)
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 bg-brand-cream/30">
        <motion.div 
          animate={{ x: shakeLogin ? [-10, 10, -10, 10, -5, 5, 0] : 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white border border-brand-blue-primary/10 shadow-2xl p-8 sm:p-10 relative overflow-hidden"
        >
          {/* Subtle accent border top */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-brand-pink-primary" />
          
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-pink-light text-brand-pink-primary relative">
              <div className="absolute inset-0 rounded-full bg-brand-pink-primary/10 animate-ping" />
              <Lock className="w-8 h-8 relative z-10" />
            </div>

            <div>
              <h2 className="font-serif text-3xl font-black text-brand-blue-primary tracking-tight">drbodyshaper</h2>
              <p className="text-xs text-brand-blue-sky mt-1 font-mono uppercase tracking-widest font-bold">Admin Suite Gateway</p>
            </div>

            <p className="text-xs text-brand-blue-sky/70 leading-relaxed font-light">
              Enter the master administrator passcode to unlock product controls, media uploads, and catalog configuration tools.
            </p>

            <form onSubmit={handleLogin} className="space-y-4 pt-2">
              <div className="relative">
                <input
                  type={showPasscode ? 'text' : 'password'}
                  required
                  placeholder="Enter administrator passcode"
                  value={passcodeInput}
                  onChange={(e) => {
                    setPasscodeInput(e.target.value);
                    if (loginError) setLoginError('');
                  }}
                  className="w-full pl-10 pr-10 py-3 text-xs bg-brand-cream border border-brand-blue-primary/15 font-mono text-center tracking-widest text-brand-blue-primary rounded-none focus:outline-brand-pink-primary font-extrabold focus:bg-white"
                />
                <span className="absolute inset-y-0 left-3 flex items-center text-brand-blue-sky/55">
                  <Key className="w-4 h-4" />
                </span>
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute inset-y-0 right-3 flex items-center text-brand-blue-sky/55 hover:text-brand-pink-primary cursor-pointer transition-colors"
                >
                  {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {loginError && (
                <motion.p 
                  initial={{ opacity: 0, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[11px] font-semibold text-brand-pink-deep text-center"
                >
                  ⚠️ {loginError}
                </motion.p>
              )}

              <button
                type="submit"
                className="w-full bg-brand-pink-primary hover:bg-brand-pink-deep text-white py-3 px-4 text-xs font-bold uppercase tracking-widest transition-all active:scale-[0.98] shadow-md cursor-pointer rounded-none flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" /> Unlock Admin Panel
              </button>
            </form>

            <div className="border-t border-brand-blue-primary/5 pt-4 text-left">
              <p className="text-[10px] text-brand-blue-sky/50 leading-relaxed font-mono text-center">
                Default Security Key: <span className="bg-brand-cream text-brand-pink-deep font-bold px-1 py-0.5 rounded-xs">admin2026</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Top Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-10 border-b border-brand-blue-primary/10 pb-6">
        <div>
          <h1 className="text-3xl font-serif font-black text-brand-blue-primary tracking-tight">Luxury Product Suite</h1>
          <p className="text-xs text-brand-blue-sky mt-1 font-mono uppercase tracking-widest">Store Admin Control Panel</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <button 
            onClick={() => {
              setChangePasscodeData({ currentPasscode: '', newPasscode: '', confirmNewPasscode: '' });
              setChangePasscodeError('');
              setChangePasscodeSuccess(false);
              setShowChangePasscodeModal(true);
            }}
            className="flex items-center justify-center gap-2 bg-white hover:bg-brand-cream text-brand-blue-primary border border-brand-blue-primary/20 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all active:scale-95 cursor-pointer rounded-none flex-1 sm:flex-initial"
          >
            <Key className="w-4 h-4 text-brand-pink-primary" /> Change Passcode
          </button>
          
          <button 
            onClick={handleAddNew}
            className="flex items-center justify-center gap-2 bg-brand-pink-primary hover:bg-brand-pink-deep text-white px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer rounded-none flex-1 sm:flex-initial"
          >
            <Plus className="w-4.5 h-4.5" /> Add New Product
          </button>

          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-600 hover:text-white text-brand-pink-deep px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all active:scale-95 cursor-pointer rounded-none border border-red-200 hover:border-red-600 flex-1 sm:flex-initial"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </div>

      {/* Main Table Grid View of Products */}
      <div className="bg-white border border-brand-blue-primary/10 shadow-xl overflow-hidden rounded-none">
        <div className="p-4 bg-brand-cream/40 border-b border-brand-blue-primary/5 flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-brand-blue-primary uppercase tracking-wider">
            Active Catalog ({products.length} Products)
          </span>
          <span className="text-[10px] text-brand-blue-sky/70 font-mono">
            Direct upload supports pictures & videos.
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-brand-blue-sky">
            <thead className="text-xs uppercase bg-brand-cream border-b border-brand-blue-primary/10 text-brand-blue-primary font-mono font-bold">
              <tr>
                <th className="px-6 py-4.5">Media</th>
                <th className="px-6 py-4.5">Product Details</th>
                <th className="px-6 py-4.5">Price (Naira)</th>
                <th className="px-6 py-4.5">Category</th>
                <th className="px-6 py-4.5">Colors Available</th>
                <th className="px-6 py-4.5">Active Sizes</th>
                <th className="px-6 py-4.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-blue-primary/5">
              {products.map((product) => {
                const primaryMedia = product.images?.[0] || '';
                return (
                  <tr key={product.id} className="hover:bg-brand-cream/30 transition-colors">
                    
                    {/* Media Thumbnail Column */}
                    <td className="px-6 py-4">
                      <div className="w-16 h-20 bg-brand-cream border border-brand-blue-primary/10 overflow-hidden relative flex-shrink-0">
                        {primaryMedia ? (
                          isVideo(primaryMedia) ? (
                            <video 
                              src={primaryMedia} 
                              muted 
                              playsInline 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <img 
                              src={primaryMedia} 
                              alt={product.name} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover" 
                            />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-brand-blue-sky/30">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 bg-brand-blue-primary text-white text-[8px] font-mono font-bold px-1 py-0.5 rounded-xs">
                          {product.images?.length || 0}F
                        </span>
                      </div>
                    </td>

                    {/* Product Name / SKU Column */}
                    <td className="px-6 py-4">
                      <div className="font-serif font-extrabold text-base text-brand-blue-primary leading-snug">
                        {product.name}
                      </div>
                      <div className="text-[10px] font-mono text-brand-blue-sky/60 mt-1 flex items-center gap-2">
                        <span>SKU: {product.sku}</span>
                        {product.badge && (
                          <span className="bg-brand-pink-light text-brand-pink-deep px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                            {product.badge}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Price Column */}
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-brand-blue-primary text-sm">
                        ₦{product.price.toLocaleString()}
                      </div>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="text-[10px] text-brand-blue-sky/40 line-through font-mono mt-0.5">
                          ₦{product.originalPrice.toLocaleString()}
                        </div>
                      )}
                    </td>

                    {/* Category Column */}
                    <td className="px-6 py-4">
                      <span className="bg-brand-cream/80 border border-brand-blue-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-pink-deep font-mono">
                        {product.categoryLabel}
                      </span>
                    </td>

                    {/* Colors List */}
                    <td className="px-6 py-4 text-xs font-medium">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {product.colors.map((c) => (
                          <span key={c} className="bg-slate-100 text-slate-800 px-1.5 py-0.5 text-[9px] rounded-xs">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Sizes List */}
                    <td className="px-6 py-4 text-xs font-mono font-bold text-brand-blue-primary">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {product.sizes.map((s) => (
                          <span key={s} className="bg-brand-pink-light/40 text-brand-blue-primary px-1.5 py-0.5 text-[9px] border border-brand-pink-medium/15">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(product)} 
                          className="p-2 bg-brand-cream hover:bg-brand-blue-primary text-brand-blue-sky hover:text-white transition-all cursor-pointer rounded-xs"
                          title="Edit Product Master"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)} 
                          className="p-2 bg-red-50 hover:bg-red-600 text-brand-pink-deep hover:text-white transition-all cursor-pointer rounded-xs"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Spacious Product Creation & Edit Modal Form */}
      <AnimatePresence>
        {editingId && (
          <div className="fixed inset-0 bg-brand-blue-primary/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Modal backdrop closer */}
            <div className="absolute inset-0" onClick={() => !isSaving && setEditingId(null)} />

            {/* Modal body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-5xl bg-white shadow-2xl z-10 flex flex-col md:flex-row max-h-[92vh] border border-brand-blue-primary/20 rounded-none overflow-hidden"
            >
              
              {/* Close Button top-right */}
              <button
                onClick={() => setEditingId(null)}
                disabled={isSaving}
                className="absolute right-4 top-4 z-50 p-2 bg-brand-cream hover:bg-brand-pink-light text-brand-blue-primary border border-brand-blue-primary/10 transition-all cursor-pointer rounded-none"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>

              {/* LEFT COLUMN: Media Dropzone & Video/Image Previews */}
              <div className="w-full md:w-[45%] p-5 sm:p-8 bg-brand-cream flex flex-col gap-6 overflow-y-auto border-b md:border-b-0 md:border-r border-brand-blue-primary/10">
                <div>
                  <h3 className="text-lg font-serif font-extrabold text-brand-blue-primary flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-brand-pink-primary" /> Product Media Upload
                  </h3>
                  <p className="text-[11px] text-brand-blue-sky/70 mt-1">
                    Directly drop pictures and videos from your local device to automatically convert and attach them.
                  </p>
                </div>

                {/* Direct Drag & Drop Zone */}
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-none p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                    dragActive 
                      ? 'border-brand-pink-medium bg-brand-pink-light/30 scale-[0.99]' 
                      : 'border-brand-blue-primary/20 hover:border-brand-pink-primary/50 bg-white hover:bg-brand-cream/30'
                  }`}
                >
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                  />
                  
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <Loader className="w-8 h-8 text-brand-pink-primary animate-spin" />
                      <p className="text-xs font-mono font-bold text-brand-blue-primary uppercase tracking-wider">Converting & Uploading...</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-brand-pink-light flex items-center justify-center text-brand-pink-deep">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-brand-blue-primary">
                          Drag & Drop Device Files
                        </p>
                        <p className="text-[10px] text-brand-blue-sky/60 mt-1 font-mono">
                          Supports PNG, JPEG, WEBP, MP4, WebM (Multiple Allowed)
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-brand-cream text-[9px] font-mono font-bold uppercase border border-brand-blue-primary/15 text-brand-blue-primary">
                        Browse Files
                      </span>
                    </>
                  )}
                </div>

                {/* Live Loaded Media Thumbnails list */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-mono uppercase font-bold text-brand-blue-primary tracking-wider">
                      Attached Media ({formData.images?.length || 0})
                    </span>
                    {formData.images && formData.images.length > 0 && (
                      <button 
                        onClick={() => setFormData(prev => ({ ...prev, images: [] }))}
                        className="text-[9px] font-mono uppercase font-bold text-brand-pink-deep hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {!formData.images || formData.images.length === 0 ? (
                    <div className="border border-brand-blue-primary/5 p-8 bg-white/50 text-center text-xs text-brand-blue-sky/50 italic">
                      No media files attached yet. Upload files from your device using the dropzone above.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {formData.images.map((imgUrl, index) => {
                        const isVid = isVideo(imgUrl);
                        return (
                          <div 
                            key={index} 
                            className="aspect-[3/4] bg-white border border-brand-blue-primary/15 relative overflow-hidden group select-none"
                          >
                            {isVid ? (
                              <video 
                                src={imgUrl} 
                                muted 
                                playsInline
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <img 
                                src={imgUrl} 
                                alt={`Attachment ${index}`} 
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover" 
                              />
                            )}
                            
                            {/* Overlay hover details & delete */}
                            <div className="absolute inset-0 bg-brand-blue-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                              <span className="text-[8px] font-mono bg-white text-brand-blue-primary px-1 py-0.5 uppercase font-bold tracking-tight rounded-xs self-start truncate max-w-full">
                                {isVid ? 'Video' : 'Image'}
                              </span>
                              
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="p-1 bg-brand-pink-primary hover:bg-brand-pink-deep text-white cursor-pointer transition-colors self-end rounded-xs"
                                title="Remove file"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Corner Badge */}
                            <span className="absolute bottom-1 left-1 bg-brand-blue-primary/70 text-white font-mono text-[7px] px-1 font-bold">
                              #{index + 1}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Fallback Manual URLs Input */}
                <div className="border-t border-brand-blue-primary/5 pt-4">
                  <label className="block text-[10px] font-mono font-bold uppercase text-brand-blue-primary mb-1">
                    Manual Media URLs (Comma Separated fallback)
                  </label>
                  <textarea 
                    placeholder="https://example.com/image1.jpg, https://example.com/video1.mp4"
                    value={formData.images?.join(', ') || ''}
                    onChange={e => setFormData({...formData, images: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                    className="w-full border border-brand-blue-primary/15 bg-white p-2.5 text-xs font-mono rounded-none focus:outline-brand-pink-primary h-14 resize-none"
                  />
                </div>

              </div>

              {/* RIGHT COLUMN: Formal Product Form Inputs */}
              <div className="w-full md:w-[55%] p-5 sm:p-8 overflow-y-auto flex flex-col text-left bg-white justify-between">
                
                {/* Form fields wrapper */}
                <div className="space-y-5">
                  <div className="border-b border-brand-blue-primary/10 pb-3">
                    <span className="text-[10px] bg-brand-pink-primary text-white font-mono font-bold px-2 py-0.5 uppercase tracking-widest">
                      {editingId === 'new' ? 'Create' : 'Modify'}
                    </span>
                    <h2 className="text-xl font-serif font-black text-brand-blue-primary mt-1.5">
                      {editingId === 'new' ? 'New Product Definition' : `Edit: ${formData.name}`}
                    </h2>
                  </div>

                  {/* Basic Info Rows */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-brand-blue-primary/80 mb-1.5 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-brand-pink-primary" /> Product Name <span className="text-brand-pink-deep">*</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="Luxury Silk Pajama Set" 
                        value={formData.name || ''}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full border border-brand-blue-primary/20 px-3 py-2.5 text-xs text-brand-blue-primary rounded-none focus:outline-brand-pink-primary font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-brand-blue-primary/80 mb-1.5 flex items-center gap-1">
                        <Coins className="w-3 h-3 text-brand-pink-primary" /> Price (₦) <span className="text-brand-pink-deep">*</span>
                      </label>
                      <input 
                        type="number" 
                        required
                        placeholder="Price in Naira" 
                        value={formData.price || ''}
                        onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                        className="w-full border border-brand-blue-primary/20 px-3 py-2.5 text-xs text-brand-blue-primary font-mono font-bold rounded-none focus:outline-brand-pink-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-brand-blue-primary/80 mb-1.5 flex items-center gap-1">
                        <Coins className="w-3 h-3 text-brand-blue-sky" /> Original Price (Naira - optional)
                      </label>
                      <input 
                        type="number" 
                        placeholder="Original Price" 
                        value={formData.originalPrice || ''}
                        onChange={e => setFormData({...formData, originalPrice: Number(e.target.value)})}
                        className="w-full border border-brand-blue-primary/20 px-3 py-2.5 text-xs text-brand-blue-primary font-mono rounded-none focus:outline-brand-pink-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-brand-blue-primary/80 mb-1.5 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-brand-pink-primary" /> Category Group
                      </label>
                      <select 
                        value={formData.category || 'pajamas'}
                        onChange={e => {
                          const catId = e.target.value;
                          const label = categoryPresets.find(c => c.id === catId)?.label || 'Shapewear';
                          setFormData({ ...formData, category: catId, categoryLabel: label });
                        }}
                        className="w-full border border-brand-blue-primary/20 px-3 py-2.5 text-xs text-brand-blue-primary font-bold rounded-none focus:outline-brand-pink-primary bg-white cursor-pointer"
                      >
                        {categoryPresets.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-brand-blue-primary/80 mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-brand-pink-primary" /> Custom Badge
                      </label>
                      <input 
                        type="text" 
                        placeholder="New, Sale, Best Seller" 
                        value={formData.badge || ''}
                        onChange={e => setFormData({...formData, badge: e.target.value})}
                        className="w-full border border-brand-blue-primary/20 px-3 py-2.5 text-xs text-brand-blue-primary rounded-none focus:outline-brand-pink-primary"
                      />
                    </div>
                  </div>

                  {/* Size Preset Selector Section */}
                  <div>
                    <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-brand-blue-primary/80 mb-2 flex items-center gap-1">
                      <Ruler className="w-3 h-3 text-brand-pink-primary" /> Sizing Selector (Click standard body scales)
                    </label>
                    <div className="flex flex-wrap gap-1.5 bg-brand-cream/40 p-2.5 border border-brand-blue-primary/5">
                      {sizePresets.map(sz => {
                        const isSelected = formData.sizes?.includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => toggleSizePreset(sz)}
                            className={`px-2.5 py-1 text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                              isSelected 
                                ? 'bg-brand-pink-primary text-white border-brand-pink-primary font-bold' 
                                : 'bg-white hover:bg-slate-50 text-brand-blue-primary border-brand-blue-primary/10'
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-1.5">
                      <input 
                        type="text" 
                        placeholder="Manual Sizes (Comma separated overrides, e.g. Free Size)" 
                        value={formData.sizes?.join(', ') || ''}
                        onChange={e => setFormData({...formData, sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                        className="w-full border border-brand-blue-primary/20 px-3 py-2 text-[10px] font-mono text-brand-blue-primary rounded-none mt-1"
                      />
                    </div>
                  </div>

                  {/* Color Preset Selector Section */}
                  <div>
                    <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-brand-blue-primary/80 mb-2 flex items-center gap-1">
                      <Palette className="w-3 h-3 text-brand-pink-primary" /> Color Selector (Quick Toggle options)
                    </label>
                    <div className="flex flex-wrap gap-1.5 bg-brand-cream/40 p-2.5 border border-brand-blue-primary/5">
                      {colorPresets.map(col => {
                        const isSelected = formData.colors?.includes(col);
                        return (
                          <button
                            key={col}
                            type="button"
                            onClick={() => toggleColorPreset(col)}
                            className={`px-2.5 py-1 text-[9px] font-sans font-bold uppercase tracking-wide transition-all cursor-pointer border rounded-xs ${
                              isSelected 
                                ? 'bg-brand-blue-primary text-white border-brand-blue-primary' 
                                : 'bg-white hover:bg-slate-50 text-brand-blue-sky border-brand-blue-primary/10'
                            }`}
                          >
                            {col}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-1.5">
                      <input 
                        type="text" 
                        placeholder="Manual Colors (Comma separated overrides)" 
                        value={formData.colors?.join(', ') || ''}
                        onChange={e => setFormData({...formData, colors: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                        className="w-full border border-brand-blue-primary/20 px-3 py-2 text-[10px] font-mono text-brand-blue-primary rounded-none mt-1"
                      />
                    </div>
                  </div>

                  {/* Description area */}
                  <div>
                    <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-brand-blue-primary/80 mb-1.5">
                      Luxury Product Story & Description
                    </label>
                    <textarea 
                      placeholder="Narrate the craftsmanship, fabric details, and beauty of this luxury piece..."
                      value={formData.description || ''}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full border border-brand-blue-primary/20 px-3 py-2 text-xs text-brand-blue-primary rounded-none focus:outline-brand-pink-primary h-20 resize-none"
                    />
                  </div>

                  {/* Dynamic Product Features List */}
                  <div>
                    <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-brand-blue-primary/80 mb-1.5">
                      Features, Fabric & Fit Bullet Points
                    </label>
                    
                    {/* Add point bar */}
                    <div className="flex gap-2 mb-2">
                      <input 
                        type="text" 
                        placeholder="e.g. 100% Mulberry silk thread structure" 
                        value={newFeatureText}
                        onChange={e => setNewFeatureText(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addFeature();
                          }
                        }}
                        className="flex-1 border border-brand-blue-primary/20 px-3 py-1.5 text-xs text-brand-blue-primary rounded-none focus:outline-brand-pink-primary"
                      />
                      <button
                        type="button"
                        onClick={addFeature}
                        className="px-3 bg-brand-blue-primary hover:bg-brand-pink-primary text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Add
                      </button>
                    </div>

                    {/* Features List Box */}
                    <div className="max-h-24 overflow-y-auto border border-brand-blue-primary/10 p-2 bg-brand-cream/15 divide-y divide-brand-blue-primary/5">
                      {!formData.features || formData.features.length === 0 ? (
                        <span className="text-[10px] text-brand-blue-sky/40 italic p-1 block">No bullets added yet.</span>
                      ) : (
                        formData.features.map((feat, idx) => (
                          <div key={idx} className="flex items-center justify-between py-1.5 px-1 group text-xs text-brand-blue-primary">
                            <span className="truncate pr-4">• {feat}</span>
                            <button
                              type="button"
                              onClick={() => removeFeature(idx)}
                              className="text-brand-pink-deep hover:text-red-700 opacity-80 hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-mono uppercase"
                            >
                              Remove
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

                {/* Footer Save Row */}
                <div className="mt-8 pt-5 border-t border-brand-blue-primary/10 flex items-center justify-end gap-3 bg-white">
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    disabled={isSaving}
                    className="px-5 py-3 border border-brand-blue-primary/20 hover:bg-brand-cream text-brand-blue-primary text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-3 bg-brand-pink-primary hover:bg-brand-pink-deep text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Save Master Product
                      </>
                    )}
                  </button>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Change Passcode Modal Popup */}
      <AnimatePresence>
        {showChangePasscodeModal && (
          <div className="fixed inset-0 bg-brand-blue-primary/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={() => setShowChangePasscodeModal(false)} />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white shadow-2xl z-10 border border-brand-blue-primary/10 overflow-hidden"
            >
              {/* Top Pink Line */}
              <div className="h-1.5 bg-brand-pink-primary w-full" />
              
              <button
                onClick={() => setShowChangePasscodeModal(false)}
                className="absolute right-4 top-4 p-1 bg-brand-cream hover:bg-brand-pink-light text-brand-blue-primary border border-brand-blue-primary/5 cursor-pointer transition-all"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>

              <form onSubmit={submitChangePasscode} className="p-6 sm:p-8 space-y-5 text-left">
                <div>
                  <h3 className="text-lg font-serif font-black text-brand-blue-primary flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-brand-pink-primary" /> Update Admin Passcode
                  </h3>
                  <p className="text-[11px] text-brand-blue-sky/70 mt-1">
                    Keep your store configuration secure by updating the master access code.
                  </p>
                </div>

                {changePasscodeError && (
                  <div className="p-3 bg-red-50 text-brand-pink-deep border border-red-100 text-xs font-semibold">
                    ⚠️ {changePasscodeError}
                  </div>
                )}

                {changePasscodeSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" /> Passcode updated successfully!
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-brand-blue-primary mb-1.5">
                      Current Passcode
                    </label>
                    <input 
                      type="password"
                      required
                      placeholder="••••••••"
                      value={changePasscodeData.currentPasscode}
                      onChange={e => setChangePasscodeData({...changePasscodeData, currentPasscode: e.target.value})}
                      className="w-full border border-brand-blue-primary/20 px-3 py-2 text-xs font-mono rounded-none focus:outline-brand-pink-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-brand-blue-primary mb-1.5">
                      New Passcode (min 4 characters)
                    </label>
                    <input 
                      type="password"
                      required
                      placeholder="••••••••"
                      value={changePasscodeData.newPasscode}
                      onChange={e => setChangePasscodeData({...changePasscodeData, newPasscode: e.target.value})}
                      className="w-full border border-brand-blue-primary/20 px-3 py-2 text-xs font-mono rounded-none focus:outline-brand-pink-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-brand-blue-primary mb-1.5">
                      Confirm New Passcode
                    </label>
                    <input 
                      type="password"
                      required
                      placeholder="••••••••"
                      value={changePasscodeData.confirmNewPasscode}
                      onChange={e => setChangePasscodeData({...changePasscodeData, confirmNewPasscode: e.target.value})}
                      className="w-full border border-brand-blue-primary/20 px-3 py-2 text-xs font-mono rounded-none focus:outline-brand-pink-primary"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowChangePasscodeModal(false)}
                    className="px-4 py-2.5 border border-brand-blue-primary/10 hover:bg-slate-50 text-brand-blue-primary text-xs font-bold uppercase tracking-widest cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-brand-pink-primary hover:bg-brand-pink-deep text-white text-xs font-bold uppercase tracking-widest cursor-pointer shadow-sm transition-colors"
                  >
                    Save Code
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
