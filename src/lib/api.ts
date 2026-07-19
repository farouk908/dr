import { getSupabase } from './supabase';
import { Product } from '../types';

// Map database row to our Product interface
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToProduct(row: any): Product {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
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
        'Note: Could not fetch products from Supabase. This usually means the "products" table has not been created yet in your Supabase dashboard. Please run the SQL schema in /supabase-schema.sql to set up your tables.',
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
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const row = mapProductToRow(product);
    const { error } = await supabase.from('products').upsert(row as any);
    if (error) {
      console.error('Error upserting product:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase upsert failed:', err);
    return false;
  }
}

export async function deleteProduct(productId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      console.error('Error deleting product:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase delete failed:', err);
    return false;
  }
}

export async function uploadMedia(file: File): Promise<string | null> {
  const readAsBase64 = (f: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(f);
    });
  };

  const supabase = getSupabase();
  if (!supabase) {
    console.log('No Supabase client found. Falling back to base64 Data URL for local presentation.');
    return readAsBase64(file);
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-media')
      .upload(filePath, file);

    if (uploadError) {
      console.warn('Supabase storage upload failed, falling back to base64 Data URL:', uploadError);
      return readAsBase64(file);
    }

    const { data } = supabase.storage
      .from('product-media')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    console.warn('Upload exception occurred, falling back to base64 Data URL:', err);
    return readAsBase64(file);
  }
}
