import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Download, MessageCircle, Mail, ArrowRight } from 'lucide-react';

const OrderSuccess: React.FC = () => {
  const location = useLocation();
  const orderSummary = location.state?.orderSummary;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!orderSummary) {
    return (
      <div className="min-h-screen bg-cream-25 pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-4">
            Pedido no encontrado
          </h2>
          <Link
            to="/"
            className="inline-flex items-center bg-gold-500 hover:bg-gold-600 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const orderNumber = orderSummary.orderCode || `SJ${Date.now().toString().slice(-8)}`;

  const generateWhatsAppMessage = () => {
    const message = `¡Hola! He realizado un pedido en Salcedo Jewels:

*Código de Pedido:* ${orderNumber}
*Cliente:* ${orderSummary.customer.firstName} ${orderSummary.customer.lastName}
*DNI:* ${orderSummary.customer.dni}
*Teléfono:* ${orderSummary.customer.phone}
*Dirección:* ${orderSummary.customer.address}, ${orderSummary.customer.city}

*Productos:*
${orderSummary.items.map((item: any) => 
  `• ${item.product.name} (x${item.quantity}) - S/ ${(item.product.price * item.quantity).toLocaleString()}`
).join('\n')}

*Total:* S/ ${orderSummary.total.toLocaleString()}
*Método de Pago:* Transferencia Bancaria

Por favor, confirmen la disponibilidad y procedan con el siguiente paso. ¡Gracias!`;

    return encodeURIComponent(message);
  };

  const generateEmailSubject = () => {
    return encodeURIComponent(`Nuevo Pedido #${orderNumber} - Salcedo Jewels`);
  };

  const generateEmailBody = () => {
    const body = `Estimado equipo de Salcedo Jewels,

He realizado un nuevo pedido con los siguientes detalles:

Número de Pedido: ${orderNumber}
Fecha: ${orderSummary.orderDate}

INFORMACIÓN DEL CLIENTE:
- Nombre: ${orderSummary.customer.firstName} ${orderSummary.customer.lastName}
- Email: ${orderSummary.customer.email}
- Teléfono: ${orderSummary.customer.phone}
- Dirección: ${orderSummary.customer.address}, ${orderSummary.customer.city}, ${orderSummary.customer.country}

PRODUCTOS:
${orderSummary.items.map((item: any) => 
  `- ${item.product.name} (Cantidad: ${item.quantity}) - $${(item.product.price * item.quantity).toLocaleString()}`
).join('\n')}

TOTAL: $${orderSummary.total.toLocaleString()}

MÉTODO DE PAGO: ${
  orderSummary.payment.method === 'transfer' ? 'Transferencia Bancaria' :
  orderSummary.payment.method === 'card' ? 'Tarjeta de Crédito' : 'Pago en Efectivo'
}

Por favor, confirmen la recepción de este pedido y procedan con los siguientes pasos.

Saludos cordiales,
${orderSummary.customer.firstName} ${orderSummary.customer.lastName}`;

    return encodeURIComponent(body);
  };

  return (
    <div className="min-h-screen bg-cream-25 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="font-playfair text-4xl font-bold text-gray-900 mb-4">
            ¡Pedido Realizado con Éxito!
          </h1>
          <p className="font-inter text-gray-600 mb-8">
            Gracias por tu compra. Hemos recibido tu pedido correctamente.
            <br />
            Tu código de seguimiento es: <span className="font-bold text-gold-600">{orderNumber}</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              to="/tracking"
              className="inline-flex items-center space-x-2 bg-white border border-gold-500 text-gold-600 hover:bg-gold-50 px-6 py-3 rounded-md font-medium transition-colors duration-200 w-full sm:w-auto justify-center"
            >
              <CheckCircle className="h-5 w-5" />
              <span>Seguir mi Pedido</span>
            </Link>
            
            <a
              href={`https://wa.me/51999999999?text=${generateWhatsAppMessage()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 w-full sm:w-auto justify-center"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Confirmar por WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-sm border border-beige-200 p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Order Info */}
            <div>
              <h2 className="font-playfair text-xl font-bold text-gray-900 mb-4">
                Detalles del Pedido
              </h2>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Número de Pedido:</span> #{orderNumber}</p>
                <p><span className="font-medium">Fecha:</span> {orderSummary.orderDate}</p>
                <p><span className="font-medium">Total:</span> <span className="font-bold text-gold-600">${orderSummary.total.toLocaleString()}</span></p>
                <p><span className="font-medium">Método de Pago:</span> {
                  orderSummary.payment.method === 'transfer' ? 'Transferencia Bancaria' :
                  orderSummary.payment.method === 'card' ? 'Tarjeta de Crédito' : 'Pago en Efectivo'
                }</p>
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <h2 className="font-playfair text-xl font-bold text-gray-900 mb-4">
                Información de Entrega
              </h2>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Nombre:</span> {orderSummary.customer.firstName} {orderSummary.customer.lastName}</p>
                <p><span className="font-medium">Email:</span> {orderSummary.customer.email}</p>
                <p><span className="font-medium">Teléfono:</span> {orderSummary.customer.phone}</p>
                <p><span className="font-medium">Dirección:</span> {orderSummary.customer.address}</p>
                <p><span className="font-medium">Ciudad:</span> {orderSummary.customer.city}, {orderSummary.customer.country}</p>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="border-t border-beige-200 pt-6">
            <h3 className="font-playfair text-lg font-bold text-gray-900 mb-4">
              Productos Pedidos
            </h3>
            <div className="space-y-4">
              {orderSummary.items.map((item: any) => (
                <div key={item.product.id} className="flex items-center space-x-4 p-4 bg-cream-50 rounded-lg">
                  <div className="w-16 h-16 bg-white rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={item.product.mainImage}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-inter font-medium text-gray-900">{item.product.name}</h4>
                    <p className="font-inter text-sm text-gray-500">{item.product.category}</p>
                    <p className="font-inter text-sm text-gray-600">Cantidad: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-playfair font-bold text-gold-600">
                      ${(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow-sm border border-beige-200 p-8 mb-8">
          <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-6">
            Próximos Pasos
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-inter font-semibold text-blue-900 mb-3">1. Confirmación</h3>
              <p className="font-inter text-sm text-blue-700">
                Nos pondremos en contacto contigo en las próximas 2-4 horas para confirmar 
                la disponibilidad de los productos y coordinar los detalles.
              </p>
            </div>

            <div className="p-6 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-inter font-semibold text-green-900 mb-3">2. Pago</h3>
              <p className="font-inter text-sm text-green-700">
                {orderSummary.payment.method === 'transfer' && 
                  'Te enviaremos los datos bancarios para realizar la transferencia.'
                }
                {orderSummary.payment.method === 'card' && 
                  'Procesaremos el pago de tu tarjeta una vez confirmada la disponibilidad.'
                }
                {orderSummary.payment.method === 'cash' && 
                  'Coordinaremos la entrega y el pago en efectivo.'
                }
              </p>
            </div>

            <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-inter font-semibold text-purple-900 mb-3">3. Preparación</h3>
              <p className="font-inter text-sm text-purple-700">
                Una vez confirmado el pago, prepararemos cuidadosamente tu pedido 
                con el embalaje de lujo que caracteriza a Salcedo Jewels.
              </p>
            </div>

            <div className="p-6 bg-gold-50 rounded-lg border border-gold-200">
              <h3 className="font-inter font-semibold text-gold-900 mb-3">4. Entrega</h3>
              <p className="font-inter text-sm text-gold-700">
                Te notificaremos cuando tu pedido esté en camino y te proporcionaremos 
                información de seguimiento para que puedas rastrear tu entrega.
              </p>
            </div>
          </div>

          {/* Contact Actions */}
          <div className="space-y-4">
            <h3 className="font-playfair text-lg font-bold text-gray-900">
            ¡Importante! Contacta con nosotros directamente para coordinar el pedido:
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={`https://wa.me/51979004991?text=${generateWhatsAppMessage()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Enviar por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="text-center">
          <Link
            to="/catalog"
            className="inline-flex items-center space-x-2 bg-gold-500 hover:bg-gold-600 text-white px-8 py-3 rounded-md font-medium transition-colors duration-200 hover:shadow-lg"
          >
            <span>Continuar Comprando</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;