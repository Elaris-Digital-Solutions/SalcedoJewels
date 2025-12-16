import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, ShoppingBag, Plus } from 'lucide-react';
import { Product } from '../types/Product';
import { useCart } from '../context/CartContext';
import { getOptimizedImageUrl } from '../utils/imageUtils';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, priority = false }) => {
  const { isInCart } = useCart();
  const optimizedImage = getOptimizedImageUrl(product.mainImage, 500);

  return (
    <div className="group bg-white rounded-lg overflow-hidden shadow-sm border border-beige-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={optimizedImage}
          alt={product.name}
          loading={priority ? "eager" : "lazy"}
          {...(priority ? { fetchPriority: "high" } : {})}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 flex space-x-2 transform scale-75 group-hover:scale-100 transition-all duration-300">
            <Link
              to={`/product/${product.id}`}
              className="bg-white bg-opacity-90 backdrop-blur-sm rounded-full p-3 hover:bg-cream-50"
              title="Ver Detalles"
            >
              <Eye className="h-5 w-5 text-gold-600" />
            </Link>
          </div>
        </div>
        {product.featured && (
          <div className="absolute top-3 left-3">
            <span className="bg-gold-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              Destacado
            </span>
          </div>
        )}
        {!product.inStock && (
          <div className="absolute top-3 right-3">
            <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              Agotado
            </span>
          </div>
        )}
        {isInCart(product.id) && product.inStock && (
          <div className="absolute bottom-3 left-3">
            <span className="absolute top-3 left-3 bg-beige-400 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">En carrito</span>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="mb-2">
          <span className="text-xs font-medium text-gold-600 uppercase tracking-wide">
            {product.category}
          </span>
        </div>
        <h3 className="font-playfair text-lg font-semibold text-gray-900 mb-2 group-hover:text-gold-700 transition-colors duration-200">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="font-playfair text-xl font-bold text-gold-600">
            ${product.price.toLocaleString()}
          </span>
          <div className="flex space-x-2">
            <Link
              to={`/product/${product.id}`}
              className="bg-gold-500 hover:bg-gold-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Ver Detalles
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;