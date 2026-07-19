export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  categoryLabel: string;
  price: number;
  originalPrice?: number;
  description: string;
  features: string[];
  images: string[]; // Two images for dual-layer hover cross-fade
  colors: string[];
  sizes: string[];
  rating: number;
  reviewsCount: number;
  isBestSeller: boolean;
  isNew: boolean;
  discountPercentage?: number;
  badge?: string;
}

export interface CartItem {
  product: Product;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
}

export type SortOption = 'newest' | 'price-low-high' | 'price-high-low' | 'rating';

export interface Review {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  sizePurchased: string;
  verified: boolean;
}
