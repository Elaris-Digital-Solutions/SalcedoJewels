import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useScrollPosition, useFilterPersistence } from '../hooks/useScrollPosition';
import ProductCard from '../components/ProductCard';

const Catalog: React.FC = () => {
  const { products } = useProducts();
  const { saveFilters, loadFilters, clearSavedFilters } = useFilterPersistence();
  
  // Load saved filters on component mount
  const savedFilters = loadFilters();
  const [searchTerm, setSearchTerm] = useState(savedFilters.searchTerm);
  const [selectedCategory, setSelectedCategory] = useState(savedFilters.selectedCategory);
  const [priceRange, setPriceRange] = useState(savedFilters.priceRange);
  const [sortBy, setSortBy] = useState(savedFilters.sortBy);
  
  const catalogRef = useScrollPosition();

  const categories = Array.from(new Set(products.map(product => product.category)));

  // Save filters whenever they change
  useEffect(() => {
    saveFilters({
      searchTerm,
      selectedCategory,
      priceRange,
      sortBy
    });
  }, [searchTerm, selectedCategory, priceRange, sortBy, saveFilters]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    
    let matchesPrice = true;
    if (priceRange) {
      const price = product.price;
      switch (priceRange) {
        case 'under-500':
          matchesPrice = price < 500;
          break;
        case '500-1000':
          matchesPrice = price >= 500 && price < 1000;
          break;
        case '1000-1500':
          matchesPrice = price >= 1000 && price < 1500;
          break;
        case 'over-1500':
          matchesPrice = price >= 1500;
          break;
      }
    }
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Sort products based on selected sort option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPriceRange('');
    setSortBy('');
    clearSavedFilters();
  };

  return (
    <div ref={catalogRef} className="min-h-screen bg-cream-25 pt-24 pb-12">
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-beige-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar joyas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Price Filter */}
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            >
              <option value="">Todos los precios</option>
              <option value="under-500">Menos de $500</option>
              <option value="500-1000">$500 - $1,000</option>
              <option value="1000-1500">$1,000 - $1,500</option>
              <option value="over-1500">Más de $1,500</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            >
              <option value="">Ordenar por</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="name-asc">Nombre: A-Z</option>
              <option value="name-desc">Nombre: Z-A</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={handleClearFilters}
              className="flex items-center justify-center space-x-2 px-4 py-2 border border-beige-300 text-gold-600 rounded-md hover:bg-cream-50 transition-colors duration-200"
            >
              <Filter className="h-4 w-4" />
              <span>Limpiar filtros</span>
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="font-inter text-gray-600">
            Mostrando {sortedProducts.length} de {products.length} productos
          </p>
        </div>

        {/* Products Grid */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedProducts.map((product) => (
              <div key={product.id} className="animate-fade-in">
                <ProductCard product={product} />
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
                Intenta ajustar los filtros o buscar con términos diferentes
              </p>
              <button
                onClick={handleClearFilters}
                className="bg-gold-500 hover:bg-gold-600 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
              >
                Ver todos los productos
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;