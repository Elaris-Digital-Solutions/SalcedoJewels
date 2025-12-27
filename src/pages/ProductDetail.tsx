import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, ShoppingBag, Truck, Shield, CreditCard, CheckCircle, XCircle, Plus, Minus } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { getOptimizedImageUrl } from '../utils/imageUtils';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getProductById } = useProducts();
  const { addToCart, getItemQuantity, updateQuantity } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const product = id ? getProductById(id) : undefined;

  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      setSelectedSize(product.variants[0].size);
    }
  }, [product]);

  const cartQuantity = product ? getItemQuantity(product.id, selectedSize || undefined) : 0;

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
  const hasVariants = product.variants && product.variants.length > 0;

  // Determine current stock and price based on selection
  const selectedVariant = hasVariants && selectedSize
    ? product.variants?.find(v => v.size === selectedSize)
    : null;

  const currentStock = hasVariants
    ? (selectedVariant?.stock || 0)
    : (product.stock || 0);

  const currentPrice = hasVariants && selectedVariant?.price
    ? selectedVariant.price
    : product.price;

  const isOutOfStock = hasVariants
    ? (selectedSize ? currentStock === 0 : false) // If variant selected, check its stock. If not, wait for selection.
    : currentStock === 0;

  const canAddToCart = hasVariants
    ? (selectedSize !== null && currentStock > 0 && (cartQuantity + quantity <= currentStock))
    : (currentStock > 0 && (cartQuantity + quantity <= currentStock));

  const handleAddToCart = () => {
    if (canAddToCart) {
      addToCart(product, quantity, selectedSize || undefined);
      setQuantity(1);
    }
  };

  const handleUpdateCartQuantity = (newQuantity: number) => {
    if (newQuantity <= 0) {
      updateQuantity(product.id, 0, selectedSize || undefined);
    } else {
      updateQuantity(product.id, newQuantity, selectedSize || undefined);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-12">
      <SEO
        title={`${product.name} | ${product.category}`}
        description={product.description}
        image={product.mainImage}
        url={`/product/${product.id}`}
      />
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
                src={getOptimizedImageUrl(allImages[selectedImage], 1200, product.brightness, product.contrast)}
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
                    className={`aspect-square rounded-md overflow-hidden border-2 transition-all duration-200 ${selectedImage === index
                        ? 'border-gold-500 ring-2 ring-gold-200'
                        : 'border-beige-200 hover:border-gold-300'
                      }`}
                  >
                    <img
                      src={getOptimizedImageUrl(image, 200, product.brightness, product.contrast)}
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
                <div className="flex flex-col">
                  <span className="font-playfair text-3xl font-bold text-gold-600">
                    ${currentPrice.toLocaleString()}
                  </span>
                </div>
                {/* Stock Status */}
                <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border ${!isOutOfStock && (!hasVariants || selectedSize)
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                  }`}>
                  {!isOutOfStock && (!hasVariants || selectedSize) ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-inter text-sm font-medium">
                        {hasVariants && selectedSize
                          ? `Disponible (${currentStock} unid.)`
                          : 'Disponible'}
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" />
                      <span className="font-inter text-sm font-medium">
                        {hasVariants && !selectedSize ? 'Selecciona una talla' : 'Agotado'}
                      </span>
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

            {/* Variants Selector */}
            {hasVariants && (
              <div>
                <h3 className="font-inter text-sm font-medium text-gray-900 mb-3">
                  Talla / Medida
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants?.map((variant) => (
                    <button
                      key={variant.size}
                      onClick={() => setSelectedSize(variant.size)}
                      disabled={variant.stock === 0}
                      className={`px-4 py-2 rounded-md border text-sm font-medium transition-all duration-200 ${selectedSize === variant.size
                          ? 'border-gold-500 bg-gold-50 text-gold-700 ring-1 ring-gold-500'
                          : variant.stock === 0
                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed decoration-slice'
                            : 'border-gray-300 hover:border-gold-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      {variant.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Cart Controls */}
            {(!hasVariants || selectedSize) && !isOutOfStock && (
              <div className="space-y-4">
                {cartQuantity > 0 ? (
                  /* Product already in cart - show cart controls */
                  <div className="bg-beige-50 border border-beige-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-inter font-medium text-gray-800">
                        En tu carrito: {cartQuantity} {cartQuantity === 1 ? 'unidad' : 'unidades'}
                        {selectedSize && <span className="text-sm text-gray-500 ml-1">({selectedSize})</span>}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleUpdateCartQuantity(cartQuantity - 1)}
                        className="p-2 bg-white border border-beige-300 rounded-md hover:bg-beige-50 transition-colors duration-200"
                      >
                        <Minus className="h-4 w-4 text-gray-600" />
                      </button>
                      <span className="font-inter font-semibold text-gray-800 min-w-[2rem] text-center">
                        {cartQuantity}
                      </span>
                      <button
                        onClick={() => handleUpdateCartQuantity(cartQuantity + 1)}
                        disabled={cartQuantity >= currentStock}
                        className={`p-2 bg-white border border-beige-300 rounded-md transition-colors duration-200 ${cartQuantity >= currentStock ? 'opacity-50 cursor-not-allowed' : 'hover:bg-beige-50'
                          }`}
                      >
                        <Plus className="h-4 w-4 text-gray-600" />
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
                          onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                          className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                        >
                          <Plus className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                      <span className="text-xs text-gray-500">
                        (Máx: {currentStock})
                      </span>
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
                  disabled={!canAddToCart}
                  className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-md font-medium transition-all duration-200 ${canAddToCart
                      ? 'bg-gold-500 hover:bg-gold-600 text-white hover:shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span>
                    {hasVariants && !selectedSize
                      ? 'Selecciona una talla'
                      : !canAddToCart
                        ? (currentStock > 0 && cartQuantity >= currentStock ? 'Máximo alcanzado' : 'Agotado')
                        : cartQuantity > 0
                          ? 'Agregar Más'
                          : 'Agregar al Carrito'
                    }
                  </span>
                </button>

                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-3 rounded-md border transition-all duration-200 ${isFavorite
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
