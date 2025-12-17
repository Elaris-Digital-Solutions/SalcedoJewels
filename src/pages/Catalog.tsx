
import React from 'react';
import SEO from '../components/SEO';
import { routeSEO } from '../config/seo';
import { Search } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useScrollPosition } from '../hooks/useScrollPosition';
import ProductCard from '../components/ProductCard';


const Catalog: React.FC = () => {
  const { products } = useProducts();
  const catalogRef = useScrollPosition();
  
  // Filter out products with 0 stock
  const sortedProducts = products.filter(product => (product.stock || 0) > 0);


  return (
    <div ref={catalogRef} className="min-h-screen bg-cream-25 pt-24 pb-12">
      <SEO title={routeSEO.catalog.title} description={routeSEO.catalog.description} url={routeSEO.catalog.path} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Catálogo de Joyas
          </h1>
          <p className="font-inter text-lg text-gray-600 max-w-2xl mx-auto">
            Explora nuestra exclusiva colección de joyería en oro italiano de 18k
          </p>
        </div>
        {/* Products Grid */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedProducts.map((product, index) => (
              <div key={product.id} className="animate-fade-in">
                <ProductCard product={product} priority={index < 6} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="font-playfair text-xl font-semibold text-gray-900 mb-2">
                No se encontraron productos
              </h3>
              <p className="font-inter text-gray-600 mb-6">
                No hay productos disponibles actualmente
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;