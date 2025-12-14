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

        {/* ...existing code... */}

        {/* ...existing code... */}

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