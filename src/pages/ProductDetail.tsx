import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, ShoppingBag, Truck, Shield, RotateCcw, CreditCard, CheckCircle, XCircle, Plus, Minus } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getProductById } = useProducts();
  const { addToCart, isInCart, getItemQuantity, updateQuantity } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const product = id ? getProductById(id) : undefined;
  const cartQuantity = product ? getItemQuantity(product.id) : 0;

  if (!product) {
    return (
      <div className="min-h-screen bg-cream-25 pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-4">
            Producto no encontrado
          </h2>
          <Link
            to="/catalog"
            className="inline-flex items-center space-x-2 text-gold-600 hover:text-gold-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al catálogo</span>
          </Link>
        </div>
      </div>
    );
  }

  const allImages = [product.mainImage, ...product.additionalImages];

  const handleAddToCart = () => {
    if (product.inStock) {
      addToCart(product, quantity);
      setQuantity(1); // Reset quantity after adding
    }
  };

  const handleUpdateCartQuantity = (newQuantity: number) => {
    if (newQuantity <= 0) {
      updateQuantity(product.id, 0);
    } else {
      updateQuantity(product.id, newQuantity);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-gold-600 transition-colors duration-200">
              Inicio
            </Link>
            <span className="text-gray-400">/</span>
            <Link to="/catalog" className="text-gray-500 hover:text-gold-600 transition-colors duration-200">
              Catálogo
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gold-600 font-medium">{product.name}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-cream-50 rounded-lg overflow-hidden border border-beige-200">
              <img
                src={allImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-md overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage === index
                        ? 'border-gold-500 ring-2 ring-gold-200'
                        : 'border-beige-200 hover:border-gold-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} - Vista ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category and Title */}
            <div>
              <span className="inline-block bg-cream-200 text-gold-800 text-xs font-medium px-3 py-1 rounded-full mb-3">
                {product.category}
              </span>
              <h1 className="font-playfair text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              <div className="flex items-center justify-between mb-4">
                <span className="font-playfair text-3xl font-bold text-gold-600">
                  ${product.price.toLocaleString()}
                </span>
                {/* Stock Status */}
                <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border ${
                  product.inStock 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {product.inStock ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-inter text-sm font-medium">Disponible</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" />
                      <span className="font-inter text-sm font-medium">Agotado</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-inter text-lg font-semibold text-gray-900 mb-3">
                Descripción
              </h3>
              <p className="font-inter text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quantity and Cart Controls */}
            {product.inStock && (
              <div className="space-y-4">
                {cartQuantity > 0 ? (
                  /* Product already in cart - show cart controls */
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-inter font-medium text-green-800">
                        En tu carrito: {cartQuantity} {cartQuantity === 1 ? 'unidad' : 'unidades'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleUpdateCartQuantity(cartQuantity - 1)}
                        className="p-2 bg-white border border-green-300 rounded-md hover:bg-green-50 transition-colors duration-200"
                      >
                        <Minus className="h-4 w-4 text-green-600" />
                      </button>
                      <span className="font-inter font-semibold text-green-800 min-w-[2rem] text-center">
                        {cartQuantity}
                      </span>
                      <button
                        onClick={() => handleUpdateCartQuantity(cartQuantity + 1)}
                        className="p-2 bg-white border border-green-300 rounded-md hover:bg-green-50 transition-colors duration-200"
                      >
                        <Plus className="h-4 w-4 text-green-600" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Product not in cart - show add to cart controls */
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className="font-inter text-sm font-medium text-gray-700">
                        Cantidad:
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                        >
                          <Minus className="h-4 w-4 text-gray-600" />
                        </button>
                        <span className="font-inter font-semibold text-gray-900 min-w-[2rem] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                        >
                          <Plus className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex space-x-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                    product.inStock
                      ? 'bg-gold-500 hover:bg-gold-600 text-white hover:shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span>
                    {!product.inStock 
                      ? 'No Disponible' 
                      : cartQuantity > 0 
                        ? 'Agregar Más' 
                        : 'Agregar al Carrito'
                    }
                  </span>
                </button>
                
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-3 rounded-md border transition-all duration-200 ${
                    isFavorite
                      ? 'border-red-300 bg-red-50 text-red-600'
                      : 'border-beige-300 hover:border-gold-300 hover:bg-cream-50 text-gray-600'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                
                <button className="p-3 rounded-md border border-beige-300 hover:border-gold-300 hover:bg-cream-50 text-gray-600 transition-all duration-200">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>

              {/* Contact for Purchase */}
              <div className="bg-cream-100 border border-beige-300 rounded-lg p-4">
                <h4 className="font-inter font-semibold text-gray-900 mb-2">
                  ¿Interesado en esta pieza?
                </h4>
                <p className="font-inter text-sm text-gray-600 mb-3">
                  Contáctanos para más información sobre disponibilidad, personalización o para programar una cita.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center space-x-2 text-gold-600 hover:text-gold-700 font-medium text-sm"
                >
                  <span>Contactar ahora</span>
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Link>
              </div>
            </div>

            {/* Product Features */}
            <div className="border-t border-beige-200 pt-6">
              <h3 className="font-inter text-lg font-semibold text-gray-900 mb-4">
                Garantías y Servicios
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-gold-500" />
                  <span className="font-inter text-sm text-gray-600">
                    Garantía de calidad y autenticidad
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Truck className="h-5 w-5 text-gold-500" />
                  <span className="font-inter text-sm text-gray-600">
                    Envío seguro y asegurado
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <RotateCcw className="h-5 w-5 text-gold-500" />
                  <span className="font-inter text-sm text-gray-600">
                    Política de devolución de 30 días
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gold-500" />
                  <span className="font-inter text-sm text-gray-600">
                    Planes de pago flexibles disponibles
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Catalog */}
        <div className="mt-12 pt-8 border-t border-beige-200">
          <Link
            to="/catalog"
            className="inline-flex items-center space-x-2 text-gold-600 hover:text-gold-700 font-medium transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al catálogo</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;