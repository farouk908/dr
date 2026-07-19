import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { Plus, Trash2, Edit2, X, Save, Upload, Loader } from 'lucide-react';
import { upsertProduct, deleteProduct, uploadMedia } from '../lib/api';
import { getExtendedSizes } from '../lib/sizes';

interface AdminPanelProps {
  products: Product[];
  setProducts: (products: Product[]) => void;
}

export default function AdminPanel({ products, setProducts }: AdminPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

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
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData(product);
  };

  const handleSave = async () => {
    if (editingId) {
      setIsSaving(true);
      let updatedProducts = [...products];
      
      if (editingId === 'new') {
        const finalSizes = formData.sizes ? getExtendedSizes(formData.sizes) : [];
        const newProduct = {
          ...formData,
          id: crypto.randomUUID(),
          images: formData.images || ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop'],
          sizes: finalSizes,
          colors: formData.colors || ['Black'],
          category: formData.category || 'shapewear',
          categoryLabel: formData.categoryLabel || 'Shapewear',
          features: formData.features || ['Seamless design', 'Comfortable fit'],
          rating: formData.rating || 5,
          reviewsCount: formData.reviewsCount || 0,
          isBestSeller: formData.isBestSeller || false,
          isNew: formData.isNew || true
        } as Product;
        
        updatedProducts = [newProduct, ...products];
        await upsertProduct(newProduct);
      } else {
        const finalSizes = formData.sizes ? getExtendedSizes(formData.sizes) : [];
        const updatedProduct = { ...products.find(p => p.id === editingId), ...formData, sizes: finalSizes } as Product;
        updatedProducts = products.map(p => p.id === editingId ? updatedProduct : p);
        await upsertProduct(updatedProduct);
      }
      
      setProducts(updatedProducts);
      setEditingId(null);
      setFormData({});
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
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
      categoryLabel: 'Shapewear',
      badge: 'New',
      sku: 'SKU-' + Math.floor(Math.random() * 10000)
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-serif font-bold text-brand-blue-primary">Product Management</h1>
        <button 
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-brand-pink-primary text-white px-4 py-2 text-sm font-bold uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="bg-white border border-brand-blue-primary/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-brand-blue-sky">
            <thead className="text-xs uppercase bg-brand-cream border-b border-brand-blue-primary/10 text-brand-blue-primary font-mono">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Colors</th>
                <th className="px-6 py-4">Sizes</th>
                <th className="px-6 py-4 min-w-[200px]">Media (URLs)</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {editingId === 'new' && (
                <tr className="border-b border-brand-blue-primary/10 bg-brand-pink-light/20">
                  <td className="px-6 py-4">
                    <input 
                      type="text" 
                      placeholder="Product Name" 
                      value={formData.name || ''}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full border border-brand-blue-primary/20 px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="number" 
                      placeholder="Price" 
                      value={formData.price || ''}
                      onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                      className="w-full border border-brand-blue-primary/20 px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="text" 
                      placeholder="Category" 
                      value={formData.categoryLabel || ''}
                      onChange={e => setFormData({...formData, categoryLabel: e.target.value})}
                      className="w-full border border-brand-blue-primary/20 px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="text" 
                      placeholder="Comma separated (e.g. Red, Blue)" 
                      value={formData.colors?.join(', ') || ''}
                      onChange={e => setFormData({...formData, colors: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                      className="w-full border border-brand-blue-primary/20 px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="text" 
                      placeholder="Comma separated (e.g. S, M, L)" 
                      value={formData.sizes?.join(', ') || ''}
                      onChange={e => setFormData({...formData, sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                      className="w-full border border-brand-blue-primary/20 px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          placeholder="Comma separated URLs" 
                          value={formData.images?.join(', ') || ''}
                          onChange={e => setFormData({...formData, images: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                          className="w-full border border-brand-blue-primary/20 px-2 py-1 text-sm flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="p-1.5 bg-brand-cream border border-brand-blue-primary/20 text-brand-blue-primary hover:bg-brand-blue-primary hover:text-white transition-colors flex items-center justify-center rounded-sm"
                          title="Upload image/video from device"
                        >
                          {isUploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        </button>
                        <input 
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept="image/*,video/*"
                          multiple
                          className="hidden"
                        />
                      </div>
                      {formData.images && formData.images.length > 0 && (
                        <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                          <span>{formData.images.length} files attached</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={handleSave} className="text-green-600 hover:text-green-800"><Save className="w-5 h-5 inline" /></button>
                    <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5 inline" /></button>
                  </td>
                </tr>
              )}
              {products.map((product) => (
                <tr key={product.id} className="border-b border-brand-blue-primary/5 hover:bg-brand-cream/50">
                  {editingId === product.id ? (
                    <>
                      <td className="px-6 py-4">
                        <input 
                          type="text" 
                          value={formData.name || ''}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className="w-full border border-brand-blue-primary/20 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="number" 
                          value={formData.price || ''}
                          onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                          className="w-full border border-brand-blue-primary/20 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="text" 
                          value={formData.categoryLabel || ''}
                          onChange={e => setFormData({...formData, categoryLabel: e.target.value})}
                          className="w-full border border-brand-blue-primary/20 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="text" 
                          placeholder="Comma separated" 
                          value={formData.colors?.join(', ') || ''}
                          onChange={e => setFormData({...formData, colors: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                          className="w-full border border-brand-blue-primary/20 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="text" 
                          placeholder="Comma separated" 
                          value={formData.sizes?.join(', ') || ''}
                          onChange={e => setFormData({...formData, sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                          className="w-full border border-brand-blue-primary/20 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <input 
                              type="text" 
                              placeholder="Comma separated URLs" 
                              value={formData.images?.join(', ') || ''}
                              onChange={e => setFormData({...formData, images: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                              className="w-full border border-brand-blue-primary/20 px-2 py-1 text-sm flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploading}
                              className="p-1.5 bg-brand-cream border border-brand-blue-primary/20 text-brand-blue-primary hover:bg-brand-blue-primary hover:text-white transition-colors flex items-center justify-center rounded-sm"
                              title="Upload image/video from device"
                            >
                              {isUploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            </button>
                            <input 
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileUpload}
                              accept="image/*,video/*"
                              multiple
                              className="hidden"
                            />
                          </div>
                          {formData.images && formData.images.length > 0 && (
                            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                              <span>{formData.images.length} files attached</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2 flex justify-end gap-2">
                        <button onClick={handleSave} className="text-green-600 hover:text-green-800"><Save className="w-5 h-5 inline" /></button>
                        <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5 inline" /></button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 font-medium text-brand-blue-primary">{product.name}</td>
                      <td className="px-6 py-4">₦{product.price.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className="bg-brand-cream px-2 py-1 text-xs font-mono text-brand-pink-primary">{product.categoryLabel}</span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {product.colors.join(', ')}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {product.sizes.join(', ')}
                      </td>
                      <td className="px-6 py-4 text-xs truncate max-w-[200px]">
                        {product.images.length} files
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleEdit(product)} className="text-brand-blue-sky hover:text-brand-blue-primary mr-3"><Edit2 className="w-4 h-4 inline" /></button>
                        <button onClick={() => handleDelete(product.id)} className="text-brand-pink-deep hover:text-red-700"><Trash2 className="w-4 h-4 inline" /></button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
