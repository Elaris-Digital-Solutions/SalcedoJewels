import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';

const WHATSAPP_NUMBER = '51979004991';

const WhatsAppButton: React.FC = () => {
  const { items, getTotalPrice } = useCart();

  let message = '';
  if (items.length > 0) {
    message =
      `¡Hola! Me gustaría comprar los siguientes productos:%0A%0A` +
      items.map(item =>
        `• ${item.product.name} (${item.product.category}) x${item.quantity} - S/ ${item.product.price.toLocaleString()} c/u`
      ).join('%0A') +
      `%0A%0ATotal: S/ ${getTotalPrice().toLocaleString()}`;
  } else {
    message = '¡Hola! Estoy interesado en productos de Salcedo Jewels.';
  }

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all duration-200"
      title="Comprar por WhatsApp"
    >
      <FaWhatsapp className="w-7 h-7" />
    </a>
  );
};

export default WhatsAppButton;
