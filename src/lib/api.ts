import { getSupabase } from './supabase';
import { Product } from '../types';
import { persistSingleProduct, deleteStoredProduct } from './storage';

// Map database row to our Product interface
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToProduct(row: any): Product {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    category: row.category as any,
    categoryLabel: row.category_label,
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    description: row.description,
    features: row.features || [],
    images: row.images || [],
    colors: row.colors || [],
    sizes: row.sizes || [],
    rating: Number(row.rating),
    reviewsCount: row.reviews_count,
    isBestSeller: row.is_best_seller,
    isNew: row.is_new,
    discountPercentage: row.discount_percentage,
  };
}

// Map our Product interface to database row
function mapProductToRow(product: Product) {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    category: product.category,
    category_label: product.categoryLabel,
    price: product.price,
    original_price: product.originalPrice,
    description: product.description,
    features: product.features,
    images: product.images,
    colors: product.colors,
    sizes: product.sizes,
    rating: product.rating,
    reviews_count: product.reviewsCount,
    is_best_seller: product.isBestSeller,
    is_new: product.isNew,
    discount_percentage: product.discountPercentage,
  };
}

export async function fetchProducts(): Promise<Product[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) {
      console.warn(
        'Note: Could not fetch products from Supabase. Table may not be created yet.',
        error
      );
      return null;
    }
    return data.map(mapRowToProduct);
  } catch (err) {
    console.warn('Supabase fetch failed or table is missing:', err);
    return null;
  }
}

export async function upsertProduct(product: Product): Promise<boolean> {
  // Always persist locally to IndexedDB & localStorage so it is never lost on refresh
  try {
    await persistSingleProduct(product);
  } catch (err) {
    console.error('Local persistence error:', err);
  }

  const supabase = getSupabase();
  if (!supabase) return true;

  try {
    const row = mapProductToRow(product);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase.from('products').upsert(row as any);
    if (error) {
      console.error('Error upserting product in Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase upsert failed:', err);
    return false;
  }
}

export async function deleteProduct(productId: string): Promise<boolean> {
  // Always delete locally from IndexedDB & localStorage
  try {
    await deleteStoredProduct(productId);
  } catch (err) {
    console.error('Local delete error:', err);
  }

  const supabase = getSupabase();
  if (!supabase) return true;

  try {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      console.error('Error deleting product from Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase delete failed:', err);
    return false;
  }
}

/**
 * Compresses an image file to an optimized JPEG base64 Data URL or uploads to Supabase.
 * Shrinks 5-10MB mobile uploads into ~80-120KB so they load instantly and never breach storage quotas.
 */
function compressImageToDataUrl(file: File, maxDimension = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      // Fallback for non-image files (e.g. video clips)
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string) || '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}

export async function uploadMedia(file: File): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) {
    return compressImageToDataUrl(file);
  }

  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-media')
      .upload(filePath, file);

    if (uploadError) {
      console.warn('Supabase storage upload failed, falling back to optimized Data URL:', uploadError);
      return compressImageToDataUrl(file);
    }

    const { data } = supabase.storage
      .from('product-media')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    console.warn('Upload exception occurred, falling back to optimized Data URL:', err);
    return compressImageToDataUrl(file);
  }
}
