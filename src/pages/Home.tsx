import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Shield, Award } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';

const Home: React.FC = () => {
  const { getMostExpensiveProducts } = useProducts();
  const featuredProducts = getMostExpensiveProducts(3);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-cream-50">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-5"></div>
        <div className="relative text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="animate-fade-in">
            <h1 className="font-playfair text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              SALCEDO
            </h1>
            <p className="font-playfair text-xl md:text-2xl text-gold-600 mb-4 italic">
              Jewels
            </p>
            <p className="font-inter text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Descubre la elegancia atemporal en cada pieza de nuestra exclusiva colección 
              de joyería en oro italiano de 18k
            </p>
            <Link
              to="/catalog"
              className="inline-flex items-center space-x-2 bg-gold-500 hover:bg-gold-600 text-white px-8 py-4 rounded-md font-medium text-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-float"
            >
              <span>Ver Catálogo</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir Salcedo Jewels?
            </h2>
            <p className="font-inter text-lg text-gray-600 max-w-2xl mx-auto">
              Compromiso con la excelencia en cada detalle
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-cream-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:bg-cream-200 transition-colors duration-300">
                <Award className="h-8 w-8 text-gold-600" />
              </div>
              <h3 className="font-playfair text-xl font-semibold text-gray-900 mb-4">
                Oro Italiano 18k
              </h3>
              <p className="font-inter text-gray-600 leading-relaxed">
                Utilizamos únicamente oro italiano de la más alta calidad para garantizar 
                durabilidad y brillo excepcional en cada pieza.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-cream-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:bg-cream-200 transition-colors duration-300">
                <Star className="h-8 w-8 text-gold-600" />
              </div>
              <h3 className="font-playfair text-xl font-semibold text-gray-900 mb-4">
                Diseño Exclusivo
              </h3>
              <p className="font-inter text-gray-600 leading-relaxed">
                Cada pieza es cuidadosamente seleccionada para reflejar elegancia y 
                sofisticación, ofreciendo joyas verdaderamente especiales.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-cream-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:bg-cream-200 transition-colors duration-300">
                <Shield className="h-8 w-8 text-gold-600" />
              </div>
              <h3 className="font-playfair text-xl font-semibold text-gray-900 mb-4">
                Garantía de Calidad
              </h3>
              <p className="font-inter text-gray-600 leading-relaxed">
                Ofrecemos garantía completa en todas nuestras piezas y servicio 
                al cliente personalizado para tu tranquilidad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Piezas Destacadas
            </h2>
            <p className="font-inter text-lg text-gray-600 max-w-2xl mx-auto">
              Descubre nuestras joyas más exclusivas y de mayor valor
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredProducts.map((product, index) => (
              <div key={product.id} className="animate-slide-up">
                <ProductCard product={product} priority={index < 3} />
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Link
              to="/catalog"
              className="inline-flex items-center space-x-2 border border-gold-500 text-gold-600 hover:bg-gold-500 hover:text-white px-8 py-3 rounded-md font-medium transition-all duration-300 hover:shadow-md"
            >
              <span>Ver Todo el Catálogo</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gold-500 to-gold-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-white mb-6">
            Encuentra la Pieza Perfecta
          </h2>
          <p className="font-inter text-xl text-cream-100 mb-8 leading-relaxed">
            Permítenos ayudarte a encontrar la joya que refleje tu estilo único y personalidad
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center space-x-2 bg-white text-gold-600 hover:bg-cream-50 px-8 py-4 rounded-md font-medium text-lg transition-all duration-300 hover:shadow-lg"
          >
            <span>Contáctanos</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
