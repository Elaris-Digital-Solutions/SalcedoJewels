import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types/Product';
import { supabase } from '../supabaseClient';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  getFeaturedProducts: () => Product[];
  getMostExpensiveProducts: (limit?: number) => Product[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        const mappedProducts: Product[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          category: item.category,
          description: item.description || '',
          mainImage: item.main_image,
          additionalImages: item.additional_images || [],
          featured: item.featured,
          inStock: item.in_stock,
          stock: item.stock,
          variants: item.variants
        }));
        setProducts(mappedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: Product) => {
    try {
      const dbProduct = {
        name: product.name,
        price: product.price,
        category: product.category,
        description: product.description,
        main_image: product.mainImage,
        additional_images: product.additionalImages,
        featured: product.featured,
        in_stock: product.inStock,
        stock: product.stock,
        variants: product.variants
      };

      const { data, error } = await supabase
        .from('products')
        .insert([dbProduct])
        .select();

      if (error) throw error;

      if (data) {
        const newProduct: Product = {
          ...product,
          id: data[0].id
        };
        setProducts(prev => [...prev, newProduct]);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error al guardar el producto en la base de datos');
    }
  };

  const updateProduct = async (id: string, updatedProduct: Partial<Product>) => {
    try {
      const dbUpdate: any = {};
      if (updatedProduct.name) dbUpdate.name = updatedProduct.name;
      if (updatedProduct.price) dbUpdate.price = updatedProduct.price;
      if (updatedProduct.category) dbUpdate.category = updatedProduct.category;
      if (updatedProduct.description) dbUpdate.description = updatedProduct.description;
      if (updatedProduct.mainImage) dbUpdate.main_image = updatedProduct.mainImage;
      if (updatedProduct.additionalImages) dbUpdate.additional_images = updatedProduct.additionalImages;
      if (updatedProduct.featured !== undefined) dbUpdate.featured = updatedProduct.featured;
      if (updatedProduct.inStock !== undefined) dbUpdate.in_stock = updatedProduct.inStock;
      if (updatedProduct.stock !== undefined) dbUpdate.stock = updatedProduct.stock;
      if (updatedProduct.variants) dbUpdate.variants = updatedProduct.variants;

      const { error } = await supabase
        .from('products')
        .update(dbUpdate)
        .eq('id', id);

      if (error) throw error;

      setProducts(prev => 
        prev.map(product => 
          product.id === id ? { ...product, ...updatedProduct } : product
        )
      );
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(prev => prev.filter(product => product.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const getProductById = (id: string) => {
    return products.find(product => product.id === id);
  };

  const getFeaturedProducts = () => {
    return products.filter(product => product.featured && product.stock > 0);
  };

  const getMostExpensiveProducts = (limit: number = 3) => {
    return [...products]
      .filter(product => product.stock > 0)
      .sort((a, b) => b.price - a.price)
      .slice(0, limit);
  };

  return (
    <ProductContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      getProductById,
      getFeaturedProducts,
      getMostExpensiveProducts
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
