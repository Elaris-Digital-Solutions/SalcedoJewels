import React from 'react';
import { Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-cream-50 border-t border-beige-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="font-playfair text-xl font-bold text-gray-900">
                SALCEDO JEWELS
              </span>
            </div>
            <p className="font-inter text-gray-600 text-sm leading-relaxed">
              Joyería de lujo en oro italiano de 18k. Cada pieza es especial y está diseñada
              para resaltar tu elegancia natural con la más alta calidad y sofisticación.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/salcedo.jewels/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-600 hover:text-gold-700 transition-colors duration-200"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-playfair text-lg font-semibold text-gray-900">
              Contacto
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gold-500" />
                <span className="font-inter text-sm text-gray-600">
                  msalcedojewels@gmail.com
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gold-500" />
                <span className="font-inter text-sm text-gray-600">
                  +51 979 004 991
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-gold-500" />
                <div className="font-inter text-sm text-gray-600">
                  <p>Lima, Perú</p>
                  <p>Chiclayo, Perú</p>
                  <p>Cajamarca, Perú</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-playfair text-lg font-semibold text-gray-900">
              Enlaces Rápidos
            </h3>
            <div className="space-y-2">
              <a href="/catalog" className="block font-inter text-sm text-gray-600 hover:text-gold-600 transition-colors duration-200">
                Catálogo Completo
              </a>
              <a href="/about" className="block font-inter text-sm text-gray-600 hover:text-gold-600 transition-colors duration-200">
                Nuestra Historia
              </a>
              <a href="/contact" className="block font-inter text-sm text-gray-600 hover:text-gold-600 transition-colors duration-200">
                Atención al Cliente
              </a>
              <a href="#" className="block font-inter text-sm text-gray-600 hover:text-gold-600 transition-colors duration-200">
                Términos y Condiciones
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-beige-200">
          <p className="font-inter text-center text-sm text-gray-600">
            © 2025 Salcedo Jewels. Todos los derechos reservados. Desarrollado por{' '}
            <a
              href="https://www.instagram.com/elarisdigitalsolutions/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-600 hover:underline"
            >
              Elaris Digital Solutions
            </a>.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;