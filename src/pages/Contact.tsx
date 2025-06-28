import React, { useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Send, Clock } from 'lucide-react';
//import { FaEnvelope } from 'react-icons/fa';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    setSent(false);
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSent(true);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        const data = await res.json();
        setError(data.error || 'Error enviando el mensaje');
      }
    } catch (err) {
      setError('Error enviando el mensaje');
    } finally {
      setSending(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-cream-25 pt-24 pb-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Contáctanos
          </h1>
          <p className="font-inter text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Estamos aquí para ayudarte a encontrar la pieza perfecta o responder cualquier pregunta
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-beige-200 p-8">
              <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-6">
                Información de Contacto
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-cream-200 rounded-full p-3 flex-shrink-0">
                    <Mail className="h-6 w-6 text-gold-600" />
                  </div>
                  <div>
                    <h3 className="font-inter font-semibold text-gray-900 mb-1">
                      Email
                    </h3>
                    <p className="font-inter text-gray-600">
                      msalcedojewels@gmail.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-cream-200 rounded-full p-3 flex-shrink-0">
                    <Phone className="h-6 w-6 text-gold-600" />
                  </div>
                  <div>
                    <h3 className="font-inter font-semibold text-gray-900 mb-1">
                      Teléfono
                    </h3>
                    <p className="font-inter text-gray-600">
                      +51 979 004 991
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-cream-200 rounded-full p-3 flex-shrink-0">
                    <MapPin className="h-6 w-6 text-gold-600" />
                  </div>
                  <div>
                    <h3 className="font-inter font-semibold text-gray-900 mb-1">
                      Ubicaciones
                    </h3>
                    <div className="font-inter text-gray-600 space-y-1">
                      <p>Lima, Perú</p>
                      <p>Chiclayo, Perú</p>
                      <p>Cajamarca, Perú</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-cream-200 rounded-full p-3 flex-shrink-0">
                    <Instagram className="h-6 w-6 text-gold-600" />
                  </div>
                  <div>
                    <h3 className="font-inter font-semibold text-gray-900 mb-1">
                      Instagram
                    </h3>
                    <a
                      href="https://www.instagram.com/salcedo.jewels/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-inter text-gold-600 hover:text-gold-700 transition-colors duration-200"
                    >
                      @salcedo.jewels
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-cream-200 rounded-full p-3 flex-shrink-0">
                    <Clock className="h-6 w-6 text-gold-600" />
                  </div>
                  <div>
                    <h3 className="font-inter font-semibold text-gray-900 mb-1">
                      Horarios
                    </h3>
                    <div className="font-inter text-gray-600 text-sm space-y-1">
                      <p>Lun - Vie: 9:00 AM - 6:00 PM</p>
                      <p>Sábado: 10:00 AM - 4:00 PM</p>
                      <p>Domingo: Cerrado</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-beige-200 p-8" id="contact-form">
              <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-6">
                Envíanos un Mensaje
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block font-inter text-sm font-medium text-gray-700 mb-2">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors duration-200"
                      placeholder="Tu nombre"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block font-inter text-sm font-medium text-gray-700 mb-2">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors duration-200"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block font-inter text-sm font-medium text-gray-700 mb-2">
                      Teléfono (opcional)
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors duration-200"
                      placeholder="+51 999 999 999"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block font-inter text-sm font-medium text-gray-700 mb-2">
                      Asunto
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors duration-200"
                    >
                      <option value="">Selecciona un asunto</option>
                      <option value="consulta-general">Consulta general</option>
                      <option value="informacion-producto">Información de producto</option>
                      <option value="personalizacion">Personalización</option>
                      <option value="cita">Solicitar cita</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block font-inter text-sm font-medium text-gray-700 mb-2">
                    Mensaje
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors duration-200 resize-vertical"
                    placeholder="Cuéntanos cómo podemos ayudarte..."
                  />
                </div>

                {sent && <div className="text-green-600 font-medium">¡Mensaje enviado correctamente!</div>}
                {error && <div className="text-red-600 font-medium">{error}</div>}

                <button
                  type="submit"
                  className="w-full bg-gold-500 hover:bg-gold-600 disabled:bg-gold-200 text-white font-bold py-3 px-6 rounded transition-all duration-200 flex items-center justify-center"
                  disabled={sending}
                >
                  <Send className="h-5 w-5 mr-2" />
                  {sending ? 'Enviando...' : 'Enviar mensaje'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 bg-gradient-to-r from-gold-500 to-gold-600 rounded-lg p-8 text-center text-white">
          <h3 className="font-playfair text-2xl font-bold mb-4">
            ¿Prefieres una consulta personalizada?
          </h3>
          <p className="font-inter text-lg mb-6 max-w-2xl mx-auto">
            Agenda una cita privada para una experiencia personalizada donde podrás 
            ver nuestras piezas en persona y recibir asesoramiento experto.
          </p>
          <a
            href="#contact-form"
            onClick={e => {
              e.preventDefault();
              const formSection = document.getElementById('contact-form');
              if (formSection) {
                formSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
              const subjectSelect = document.getElementById('subject');
              if (subjectSelect) {
                (subjectSelect as HTMLSelectElement).value = 'cita';
                // Si usas useState, también actualiza el estado:
                setFormData(prev => ({ ...prev, subject: 'cita' }));
              }
            }}
            className="inline-flex items-center bg-white text-gold-600 hover:bg-cream-50 px-8 py-3 rounded-md font-medium transition-colors duration-200 hover:shadow-lg"
          >
            Agendar cita
          </a>
        </div>
      </div>
    </div>
  );
};

export default Contact;