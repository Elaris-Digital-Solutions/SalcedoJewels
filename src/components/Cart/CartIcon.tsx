import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useGeoRestriction } from '../../context/GeoRestrictionContext';

interface CartIconProps {
  onClick: () => void;
}

const CartIcon: React.FC<CartIconProps> = ({ onClick }) => {
  const { getTotalItems } = useCart();
  const { isRestricted } = useGeoRestriction();
  const totalItems = getTotalItems();

  if (isRestricted) return null;

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-700 hover:text-gold-600 transition-colors duration-200"
    >
      <ShoppingBag className="h-6 w-6" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-gold-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </button>
  );
};

export default CartIcon;