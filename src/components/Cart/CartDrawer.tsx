import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import { useGeoRestriction } from '../../context/GeoRestrictionContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const { isRestricted, reason } = useGeoRestriction();

  if (!isOpen) return null;

  if (isRestricted) {
    return (
      <>
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300"
          onClick={onClose}
        />
        <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-xl">
          <div className="flex flex-col h-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-playfair text-xl font-bold text-gray-900">
                Catálogo limitado
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-cream-100 rounded-full transition-colors duration-200"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 flex items-center">
              <div className="space-y-3 text-gray-700">
                <p>
                  Por restricciones geográficas el carrito no está disponible en tu ubicación.
                </p>
                <p className="text-sm text-gray-500">
                  {reason || 'Contáctanos para coordinar tu compra y obtener precios.'}
                </p>
                <Link
                  to="/contact"
                  onClick={onClose}
                  className="inline-flex items-center bg-gold-500 hover:bg-gold-600 text-white px-5 py-2 rounded-md font-medium transition-colors duration-200"
                >
                  Escríbenos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 transform transition-transform duration-300 shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-beige-200">
            <h2 className="font-playfair text-xl font-bold text-gray-900">
              Carrito de Compras
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-cream-100 rounded-full transition-colors duration-200"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-cream-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="font-playfair text-lg font-semibold text-gray-900 mb-2">
                  Tu carrito está vacío
                </h3>
                <p className="font-inter text-gray-600 mb-6">
                  Agrega algunos productos para comenzar
                </p>
                <Link
                  to="/catalog"
                  onClick={onClose}
                  className="inline-flex items-center bg-gold-500 hover:bg-gold-600 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
                >
                  Ver Catálogo
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  const variant = item.selectedSize && item.product.variants 
                    ? item.product.variants.find(v => v.size === item.selectedSize)
                    : null;
                  const price = variant && variant.price ? variant.price : item.product.price;

                  return (
                  <div key={`${item.product.id}-${item.selectedSize || 'default'}`} className="flex items-center space-x-4 p-4 border border-beige-200 rounded-lg">
                    <div className="w-16 h-16 bg-cream-50 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.mainImage}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-inter font-medium text-gray-900 truncate">
                        {item.product.name}
                      </h4>
                      <p className="font-inter text-sm text-gray-500">
                        {item.product.category}
                        {item.selectedSize && <span className="ml-1 text-xs bg-gray-100 px-1 rounded">Talla: {item.selectedSize}</span>}
                      </p>
                      <p className="font-playfair font-bold text-gold-600">
                        ${price.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedSize)}
                          className="p-1 hover:bg-cream-100 rounded-full transition-colors duration-200"
                        >
                          <Minus className="h-4 w-4 text-gray-500" />
                        </button>
                        <span className="font-inter text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedSize)}
                          className="p-1 hover:bg-cream-100 rounded-full transition-colors duration-200"
                        >
                          <Plus className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                        className="p-1 hover:bg-red-100 rounded-full transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-beige-200 p-6 space-y-4">
              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="font-inter text-lg font-semibold text-gray-900">
                  Total:
                </span>
                <span className="font-playfair text-xl font-bold text-gold-600">
                  ${getTotalPrice().toLocaleString()}
                </span>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Link
                  to="/checkout"
                  onClick={onClose}
                  className="w-full bg-gold-500 hover:bg-gold-600 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span>Proceder con la Compra</span>
                </Link>
                
                <button
                  onClick={clearCart}
                  className="w-full border border-red-300 text-red-600 hover:bg-red-50 px-6 py-2 rounded-md font-medium transition-colors duration-200"
                >
                  Vaciar Carrito
                </button>
              </div>

              {/* Note */}
              <p className="font-inter text-xs text-gray-500 text-center">
                Completa tu información para finalizar la compra
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;