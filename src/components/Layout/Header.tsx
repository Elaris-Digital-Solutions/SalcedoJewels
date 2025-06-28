import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CartIcon from '../Cart/CartIcon';
import CartDrawer from '../Cart/CartDrawer';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Catálogo', path: '/catalog' },
    { name: 'Sobre Nosotros', path: '/about' },
    { name: 'Contacto', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-beige-200 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="font-playfair text-2xl font-bold text-gray-900">
                SALCEDO
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`font-inter text-sm font-medium transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'text-gold-600 border-b-2 border-gold-500'
                      : 'text-gray-700 hover:text-gold-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Cart Icon */}
              <CartIcon onClick={() => setIsCartOpen(true)} />

              {/* Admin Link - Solo visible si está autenticado */}
              {isAuthenticated && (
                <Link
                  to="/admin"
                  className="hidden md:inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gold-700 bg-cream-100 rounded-md hover:bg-cream-200 transition-colors duration-200"
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-700 hover:text-gold-600"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden pb-4">
              <nav className="flex flex-col space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`font-inter text-sm font-medium py-2 px-4 rounded-md transition-colors duration-200 ${
                      isActive(item.path)
                        ? 'text-gold-600 bg-cream-100'
                        : 'text-gray-700 hover:text-gold-600 hover:bg-cream-50'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                {/* Admin Link móvil - Solo visible si está autenticado */}
                {isAuthenticated && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="font-inter text-sm font-medium py-2 px-4 text-gold-700 bg-cream-200 rounded-md hover:bg-cream-300 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Header;