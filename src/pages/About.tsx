import React from 'react';
import { Heart, Award, Users, Gem } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Sobre Nosotros
          </h1>
          <p className="font-inter text-xl text-gray-600 leading-relaxed">
            La historia detrás de Salcedo Jewels y nuestro compromiso con la excelencia
          </p>
        </div>

        {/* Story Section */}
        <div className="mb-16">
          <div className="bg-cream-100 rounded-lg p-8 mb-8">
            <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-6">
              Nuestra Historia
            </h2>
            <div className="space-y-4 font-inter text-gray-600 leading-relaxed">
              <p>
                Salcedo Jewels nació de una pasión por la belleza y la artesanía excepcional. 
                Fundada con la visión de crear joyas que no solo adornen, sino que cuenten 
                historias y capturen momentos especiales de la vida.
              </p>
              <p>
                Cada pieza de nuestra colección está meticulosamente diseñada y elaborada 
                usando únicamente oro italiano de 18k, garantizando no solo la belleza 
                estética, sino también la durabilidad y el valor que mereces.
              </p>
              <p>
                Nos especializamos en crear joyas que reflejan elegancia, sofisticación 
                y un toque de lujo cotidiano. Cada pieza es única y está esperando el 
                momento perfecto para encontrarse con su dueña ¿eres tú?
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="font-playfair text-2xl font-bold text-gray-900 text-center mb-12">
            Nuestros Valores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center p-6 rounded-lg border border-beige-200 hover:shadow-md transition-shadow duration-300">
              <div className="bg-cream-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Gem className="h-8 w-8 text-gold-600" />
              </div>
              <h3 className="font-playfair text-xl font-semibold text-gray-900 mb-3">
                Calidad Excepcional
              </h3>
              <p className="font-inter text-gray-600 leading-relaxed">
                Utilizamos únicamente materiales de la más alta calidad y técnicas 
                artesanales tradicionales para crear piezas duraderas y hermosas.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg border border-beige-200 hover:shadow-md transition-shadow duration-300">
              <div className="bg-cream-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-gold-600" />
              </div>
              <h3 className="font-playfair text-xl font-semibold text-gray-900 mb-3">
                Pasión por el Detalle
              </h3>
              <p className="font-inter text-gray-600 leading-relaxed">
                Cada pieza es revisada meticulosamente para asegurar que cumple 
                con nuestros estándares de perfección y elegancia.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg border border-beige-200 hover:shadow-md transition-shadow duration-300">
              <div className="bg-cream-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-gold-600" />
              </div>
              <h3 className="font-playfair text-xl font-semibold text-gray-900 mb-3">
                Compromiso con la Excelencia
              </h3>
              <p className="font-inter text-gray-600 leading-relaxed">
                Nos esforzamos por superar las expectativas en cada interacción, 
                desde el diseño hasta el servicio al cliente.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg border border-beige-200 hover:shadow-md transition-shadow duration-300">
              <div className="bg-cream-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gold-600" />
              </div>
              <h3 className="font-playfair text-xl font-semibold text-gray-900 mb-3">
                Atención Personalizada
              </h3>
              <p className="font-inter text-gray-600 leading-relaxed">
                Creemos en la importancia de una experiencia personalizada, 
                trabajando contigo para encontrar la pieza perfecta.
              </p>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="bg-gradient-to-r from-gold-500 to-gold-600 rounded-lg p-8 text-center text-white">
          <h2 className="font-playfair text-2xl font-bold mb-4">
            Nuestra Misión
          </h2>
          <p className="font-inter text-lg leading-relaxed max-w-3xl mx-auto">
            Crear joyas excepcionales que capturen la esencia de momentos especiales 
            y se conviertan en tesoros familiares que perduren por generaciones. 
            Cada pieza de Salcedo Jewels está diseñada para ser más que una joya: 
            es una expresión de amor, elegancia y belleza atemporal.
          </p>
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center">
          <h3 className="font-playfair text-2xl font-bold text-gray-900 mb-4">
            ¿Tienes alguna pregunta?
          </h3>
          <p className="font-inter text-gray-600 mb-6">
            Nos encantaría conocerte y ayudarte a encontrar la pieza perfecta
          </p>
          <a
            href="/contact"
            className="inline-flex items-center bg-gold-500 hover:bg-gold-600 text-white px-8 py-3 rounded-md font-medium transition-colors duration-200 hover:shadow-lg"
          >
            Contáctanos
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;