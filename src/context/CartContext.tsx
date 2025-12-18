import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types/Product';
import { useGeoRestriction } from './GeoRestrictionContext';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, size?: string) => void;
  removeFromCart: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isInCart: (productId: string, size?: string) => boolean;
  getItemQuantity: (productId: string, size?: string) => number;
  isCartBlocked: boolean;
  restrictionReason?: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { isRestricted, reason } = useGeoRestriction();
  const isCartBlocked = isRestricted;

  // Cargar carrito desde localStorage al inicializar
  useEffect(() => {
    const savedCart = localStorage.getItem('salcedo-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (isCartBlocked) {
      localStorage.removeItem('salcedo-cart');
      return;
    }
    localStorage.setItem('salcedo-cart', JSON.stringify(items));
  }, [items, isCartBlocked]);

  // Limpiar carrito si el acceso está bloqueado
  useEffect(() => {
    if (isCartBlocked && items.length > 0) {
      setItems([]);
    }
  }, [isCartBlocked, items.length]);

  const isBlocked = () => {
    if (isCartBlocked) {
      console.warn('El carrito está deshabilitado para esta ubicación');
      return true;
    }
    return false;
  };

  const addToCart = (product: Product, quantity: number = 1, size?: string) => {
    if (isBlocked()) return;
    setItems(prevItems => {
      const existingItem = prevItems.find(item => 
        item.product.id === product.id && item.selectedSize === size
      );
      
      if (existingItem) {
        return prevItems.map(item =>
          item.product.id === product.id && item.selectedSize === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { product, quantity, selectedSize: size }];
      }
    });
  };

  const removeFromCart = (productId: string, size?: string) => {
    if (isBlocked()) return;
    setItems(prevItems => prevItems.filter(item => 
      !(item.product.id === productId && item.selectedSize === size)
    ));
  };

  const updateQuantity = (productId: string, quantity: number, size?: string) => {
    if (isBlocked()) return;
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId && item.selectedSize === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    if (isBlocked()) {
      setItems([]);
      return;
    }
    setItems([]);
  };

  const getTotalItems = () => {
    if (isCartBlocked) return 0;
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    if (isCartBlocked) return 0;
    return items.reduce((total, item) => {
      let price = item.product.price;
      if (item.selectedSize && item.product.variants) {
        const variant = item.product.variants.find(v => v.size === item.selectedSize);
        if (variant && variant.price) {
          price = variant.price;
        }
      }
      return total + (price * item.quantity);
    }, 0);
  };

  const isInCart = (productId: string, size?: string) => {
    if (isCartBlocked) return false;
    return items.some(item => item.product.id === productId && item.selectedSize === size);
  };

  const getItemQuantity = (productId: string, size?: string) => {
    if (isCartBlocked) return 0;
    const item = items.find(item => item.product.id === productId && item.selectedSize === size);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      isInCart,
      getItemQuantity,
      isCartBlocked,
      restrictionReason: reason
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};