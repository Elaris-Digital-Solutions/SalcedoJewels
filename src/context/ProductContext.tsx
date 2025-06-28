import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '../types/Product';
import { ProductFileService, ProductFileInfo } from '../services/ProductFileService';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
  getFeaturedProducts: () => Product[];
  getMostExpensiveProducts: (limit?: number) => Product[];
  registerProductsFromFiles: () => Promise<{ success: number; errors: string[] }>;
  getPendingProducts: () => Promise<ProductFileInfo[]>;
  validateProductFiles: () => Promise<{ valid: ProductFileInfo[]; invalid: { code: string; issues: string[] }[] }>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Mock data for initial products
const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Aretes Mariposa con Brillantes',
    price: 1449.9,
    category: 'Aretes',
    description: 'Elegantes aretes en forma de mariposa elaborados en oro italiano de 18k, adornados con brillantes que capturan y reflejan la luz de manera espectacular. Diseño delicado y sofisticado perfecto para ocasiones especiales.',
    mainImage: 'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=800',
    additionalImages: [
      'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    featured: true,
    inStock: true
  },
  {
    id: '2',
    name: 'Collar Corazón Eterno',
    price: 2299.0,
    category: 'Collares',
    description: 'Hermoso collar con dije en forma de corazón en oro italiano de 18k. Simboliza el amor eterno con un diseño elegante y atemporal. Perfecto como regalo especial o para uso diario sofisticado.',
    mainImage: 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=800',
    additionalImages: [
      'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    featured: true,
    inStock: true
  },
  {
    id: '3',
    name: 'Anillo Solitario Diamante',
    price: 3599.0,
    category: 'Anillos',
    description: 'Magnífico anillo solitario con diamante central en oro italiano de 18k. Diseño clásico y elegante que resalta la belleza natural del diamante. Ideal para compromisos y momentos especiales.',
    mainImage: 'https://images.pexels.com/photos/1721932/pexels-photo-1721932.jpeg?auto=compress&cs=tinysrgb&w=800',
    additionalImages: [
      'https://images.pexels.com/photos/1721932/pexels-photo-1721932.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    featured: true,
    inStock: true
  },
  {
    id: '4',
    name: 'Pulsera Cadena Delicada',
    price: 899.0,
    category: 'Pulseras',
    description: 'Delicada pulsera de cadena en oro italiano de 18k con eslabones finamente trabajados. Perfecta para uso diario o para combinar con otros accesorios de la colección.',
    mainImage: 'https://images.pexels.com/photos/691046/pexels-photo-691046.jpeg?auto=compress&cs=tinysrgb&w=800',
    additionalImages: [
      'https://images.pexels.com/photos/691046/pexels-photo-691046.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    featured: false,
    inStock: true
  }
];

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = (id: string, updatedProduct: Partial<Product>) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === id ? { ...product, ...updatedProduct } : product
      )
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const getProductById = (id: string) => {
    return products.find(product => product.id === id);
  };

  const getFeaturedProducts = () => {
    return products.filter(product => product.featured);
  };

  const getMostExpensiveProducts = (limit: number = 3) => {
    return [...products]
      .sort((a, b) => b.price - a.price)
      .slice(0, limit);
  };

  // New function to register products from files
  const registerProductsFromFiles = async (): Promise<{ success: number; errors: string[] }> => {
    try {
      const validation = await ProductFileService.validateProductFiles();
      const errors: string[] = [];
      let successCount = 0;

      // Register valid products
      for (const fileInfo of validation.valid) {
        const product = await ProductFileService.createProductFromFile(fileInfo);
        if (product) {
          // Check if product already exists (by name and category)
          const existingProduct = products.find(p => 
            p.name === product.name && p.category === product.category
          );
          
          if (!existingProduct) {
            addProduct(product);
            successCount++;
          } else {
            errors.push(`Producto "${product.name}" ya existe en el catálogo`);
          }
        } else {
          errors.push(`Error al crear producto desde archivo: ${fileInfo.code}`);
        }
      }

      // Add errors for invalid products
      for (const invalid of validation.invalid) {
        errors.push(`Producto "${invalid.code}": ${invalid.issues.join(', ')}`);
      }

      return { success: successCount, errors };
    } catch (error) {
      console.error('Error registering products from files:', error);
      return { success: 0, errors: ['Error interno del sistema'] };
    }
  };

  // Get pending products (files that exist but aren't registered)
  const getPendingProducts = async (): Promise<ProductFileInfo[]> => {
    try {
      const availableProducts = await ProductFileService.getAvailableProducts();
      const registeredCodes = products.map(p => {
        // Try to reconstruct the code from product data
        const categoryMap: { [key: string]: string } = {
          'Anillos': '1',
          'Aretes': '2',
          'Collares': '3',
          'Pulseras': '4',
          'Conjuntos': '5'
        };
        const categoryCode = Object.entries(categoryMap).find(([name]) => name === p.category)?.[1] || '0';
        const nameCode = p.name.replace(/\s+/g, '');
        return `${categoryCode}-${nameCode}-${p.price}`;
      });

      return availableProducts.filter(product => 
        !registeredCodes.some(code => product.code.includes(code))
      );
    } catch (error) {
      console.error('Error getting pending products:', error);
      return [];
    }
  };

  // Validate product files
  const validateProductFiles = async () => {
    return await ProductFileService.validateProductFiles();
  };

  return (
    <ProductContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      getProductById,
      getFeaturedProducts,
      getMostExpensiveProducts,
      registerProductsFromFiles,
      getPendingProducts,
      validateProductFiles
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
