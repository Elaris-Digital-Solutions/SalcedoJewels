
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

      {/* Hero */}
      <section className="relative overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-gold-500 via-gold-600 to-gold-700 opacity-95"></div>
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-white">
          <div className="max-w-3xl">
            <p className="uppercase tracking-[0.2em] text-sm font-semibold mb-3 text-white/80">Nueva colección</p>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold leading-tight mb-4">
              Catálogo de joyas en oro 18k
            </h1>
            <p className="font-inter text-lg md:text-xl text-cream-50 mb-6">
              Explora anillos, aretes, collares y pulseras con elegancia atemporal, seleccionados para destacar.
            </p>
            <a
              href="#catalogo-grid"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('catalogo-grid')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center px-5 py-3 bg-white text-gold-700 rounded-md font-medium shadow hover:shadow-lg transition-all duration-200"
            >
              Ver piezas disponibles
            </a>
          </div>
        </div>
      </section>

      <div id="catalogo-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Products Grid */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {sortedProducts.map((product, index) => (
              <div key={product.id} className="animate-fade-in">
                <ProductCard product={product} priority={index < 6} compact={true} />
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