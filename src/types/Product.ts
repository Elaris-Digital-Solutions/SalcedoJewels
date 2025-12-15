export interface ProductVariant {
  size: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  mainImage: string;
  additionalImages: string[];
  featured?: boolean;
  inStock?: boolean;
  stock?: number;
  variants?: ProductVariant[];
  sortOrder?: number;
}

export interface ProductCode {
  category: string;
  name: string;
  price: number;
  images: string[];
}