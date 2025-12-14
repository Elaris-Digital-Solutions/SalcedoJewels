import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types/Product';
import { supabase } from '../supabaseClient';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  addProduct: (product: Product) => Promise<Product>;
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
        .select(`
          *,
          product_images (
            public_id,
            secure_url,
            is_main,
            sort_order,
            created_at
          )
        `)
        .order('sort_order', { foreignTable: 'product_images', ascending: true });
      
      if (error) throw error;
      
      if (data) {
        const mappedProducts: Product[] = data.map((item: any) => {
          const relatedImages: any[] = Array.isArray(item.product_images) ? item.product_images : [];
          const sorted = [...relatedImages].sort((a, b) => {
            const aMain = a?.is_main ? 1 : 0;
            const bMain = b?.is_main ? 1 : 0;
            if (aMain !== bMain) return bMain - aMain;
            const aOrder = typeof a?.sort_order === 'number' ? a.sort_order : 0;
            const bOrder = typeof b?.sort_order === 'number' ? b.sort_order : 0;
            if (aOrder !== bOrder) return aOrder - bOrder;
            const aCreated = a?.created_at ? Date.parse(a.created_at) : 0;
            const bCreated = b?.created_at ? Date.parse(b.created_at) : 0;
            return aCreated - bCreated;
          });

          const mainRow = sorted.find(img => img?.is_main) || sorted[0];
          const mainImageFromRelation = mainRow?.secure_url as string | undefined;
          const additionalFromRelation = sorted
            .filter(img => img && img !== mainRow)
            .map(img => img.secure_url)
            .filter(Boolean);

          const legacyAdditional: string[] = Array.isArray(item.additional_images) ? item.additional_images : [];

          return {
            id: item.id,
            name: item.name,
            price: Number(item.price),
            category: item.category,
            description: item.description || '',
            mainImage: mainImageFromRelation || item.main_image,
            additionalImages: additionalFromRelation.length > 0 ? additionalFromRelation : legacyAdditional,
            featured: item.featured,
            inStock: item.in_stock,
            stock: item.stock,
            variants: item.variants
          };
        });
        setProducts(mappedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: Product): Promise<Product> => {
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
        return newProduct;
      }

      throw new Error('No se recibió el producto creado desde Supabase');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error al guardar el producto en la base de datos');
      throw error;
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
      const res = await fetch('/api/delete-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId: id, invalidate: true })
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw payload || new Error('No se pudo eliminar el producto');
      }

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
