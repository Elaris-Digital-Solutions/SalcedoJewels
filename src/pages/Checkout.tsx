import React, { useState } from 'react';
import SEO from '../components/SEO';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft, CreditCard, Shield, CheckCircle, User, MapPin, Phone, Mail, Calendar, Lock, AlertCircle } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';

interface CustomerData {
  firstName: string;
  lastName: string;
  dni: string;
  phone: string;
  address: string;
  department: string;
  city: string;
  country: string;
}

interface PaymentData {
  method: 'transfer';
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
  currency?: 'PEN' | 'USD';
  installments: number;
}

const Checkout: React.FC = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { updateProduct } = useProducts();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [customerData, setCustomerData] = useState<CustomerData>({
    firstName: '',
    lastName: '',
    dni: '',
    phone: '',
    address: '',
    department: '',
    city: '',
    country: 'Perú'
  });

  const [paymentData, setPaymentData] = useState<PaymentData>({
    method: 'transfer',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    currency: 'USD',
    installments: 1
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<CustomerData>>({});

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream-25 pt-24 pb-12 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-cream-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-4">
            Tu carrito está vacío
          </h2>
          <p className="font-inter text-gray-600 mb-6">
            Agrega algunos productos antes de proceder con la compra
          </p>
          <Link
            to="/catalog"
            className="inline-flex items-center bg-gold-500 hover:bg-gold-600 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
          >
            Ver Catálogo
          </Link>
        </div>
      </div>
    );
  }

  const handleCustomerDataChange = (field: keyof CustomerData, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentDataChange = (field: keyof PaymentData, value: string | number) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const getStep1Errors = () => {
    const errors: Partial<CustomerData> = {};
    
    if (!customerData.firstName.trim()) errors.firstName = 'El nombre es requerido';
    if (!customerData.lastName.trim()) errors.lastName = 'Los apellidos son requeridos';
    
    const dniRegex = /^\d{8}$/;
    if (!customerData.dni.trim()) {
      errors.dni = 'El DNI es requerido';
    } else if (!dniRegex.test(customerData.dni)) {
      errors.dni = 'DNI inválido (debe tener 8 dígitos)';
    }

    const phoneRegex = /^\+?[\d\s-]{9,}$/;
    if (!customerData.phone.trim()) {
      errors.phone = 'El teléfono es requerido';
    } else if (!phoneRegex.test(customerData.phone)) {
      errors.phone = 'Teléfono inválido (mínimo 9 dígitos)';
    }

    if (!customerData.address.trim()) errors.address = 'La dirección es requerida';
    if (!customerData.department.trim()) errors.department = 'El departamento es requerido';
    if (!customerData.city.trim()) errors.city = 'La ciudad es requerida';

    return errors;
  };

  const validateStep1 = () => {
    const errors = getStep1Errors();
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    return paymentData.method === 'transfer';
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitOrder = async () => {
    if (!agreedToTerms) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }

    setIsProcessing(true);

    // Create order summary
    const orderSummary = {
      customer: customerData,
      payment: paymentData,
      items: items,
      total: getTotalPrice(),
      orderDate: new Date().toLocaleDateString('es-PE'),
      orderCode: ''
    };

    try {
      // Generar código de pedido único (ej: ORD-123456)
      const orderCode = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      
      // Insertar pedido en Supabase
      const { error } = await supabase
        .from('orders')
        .insert([
          {
            order_code: orderCode,
            customer_name: `${customerData.firstName} ${customerData.lastName}`,
            customer_dni: customerData.dni,
            customer_phone: customerData.phone,
            shipping_address: `${customerData.address}, ${customerData.city}, ${customerData.department}`,
            items: items, // Supabase guardará esto como JSON si la columna es tipo JSON/JSONB
            total_amount: getTotalPrice(),
            payment_method: 'Transferencia Bancaria',
            installments: paymentData.installments,
            status: 'Recibido'
          }
        ]);

      if (error) {
        console.error('Error al guardar en Supabase:', error);
        // Opcional: Mostrar error al usuario o continuar si quieres que sea "optimista"
        // alert('Hubo un error al guardar el pedido. Por favor contáctanos.');
      } else {
        console.log('Pedido guardado en Supabase exitosamente');
        // Actualizar el resumen con el código
        orderSummary.orderCode = orderCode;

        // Actualizar stock de productos
        for (const item of items) {
          try {
            // 1. Obtener el producto actual para asegurar datos frescos
            const { data: productData, error: productError } = await supabase
              .from('products')
              .select('*')
              .eq('id', item.product.id)
              .single();

            if (productError || !productData) {
              console.error(`Error al obtener producto ${item.product.id}:`, productError);
              continue;
            }

            let newStock = productData.stock;
            let newVariants = productData.variants;
            let newInStock = productData.in_stock;

            // 2. Calcular nuevo stock
            if (item.selectedSize && Array.isArray(newVariants)) {
              // Es un producto con variantes
              newVariants = newVariants.map((v: any) => {
                if (v.size === item.selectedSize) {
                  return { ...v, stock: Math.max(0, v.stock - item.quantity) };
                }
                return v;
              });
              
              // Recalcular stock total basado en variantes
              newStock = newVariants.reduce((acc: number, v: any) => acc + (v.stock || 0), 0);
            } else {
              // Producto simple
              newStock = Math.max(0, productData.stock - item.quantity);
            }

            // 3. Determinar si sigue en stock
            newInStock = newStock > 0;

            // 4. Actualizar producto usando el contexto para mantener el estado local sincronizado
            await updateProduct(item.product.id, {
              stock: newStock,
              variants: newVariants,
              inStock: newInStock
            });

          } catch (err) {
            console.error(`Error procesando stock para ${item.product.id}:`, err);
          }
        }
      }
    } catch (error) {
      console.error('Error inesperado:', error);
    }

    // Simulate processing delay for UX
    setTimeout(() => {
      console.log('Order submitted:', orderSummary);
      clearCart();
      setIsProcessing(false);
      navigate('/order-success', { state: { orderSummary } });
    }, 2000);
  };

  const subtotal = getTotalPrice();
  const total = subtotal;

  return (
    <div className="min-h-screen bg-cream-25 pt-24 pb-12">
      <SEO title="Checkout" description="Proceso de compra" url="/checkout" noindex />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/catalog"
            className="inline-flex items-center space-x-2 text-gold-600 hover:text-gold-700 font-medium transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Continuar comprando</span>
          </Link>
          
          <h1 className="font-playfair text-4xl font-bold text-gray-900 mb-4">
            Finalizar Compra
          </h1>
          
          {/* Progress Steps */}
          <div className="flex items-center space-x-4 mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step 
                    ? 'bg-gold-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step ? 'text-gold-600' : 'text-gray-500'
                }`}>
                  {step === 1 ? 'Información' : step === 2 ? 'Pago' : 'Confirmación'}
                </span>
                {step < 3 && (
                  <div className={`w-12 h-0.5 ml-4 ${
                    currentStep > step ? 'bg-gold-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Customer Information */}
            {currentStep === 1 && (
              <div className="bg-white rounded-lg shadow-sm border border-beige-200 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-cream-200 rounded-full p-2">
                    <User className="h-5 w-5 text-gold-600" />
                  </div>
                  <h2 className="font-playfair text-2xl font-bold text-gray-900">
                    Información Personal
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-inter text-sm font-medium text-gray-700 mb-2">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        value={customerData.firstName}
                        onChange={(e) => {
                          handleCustomerDataChange('firstName', e.target.value);
                          if (formErrors.firstName) setFormErrors(prev => ({ ...prev, firstName: undefined }));
                        }}
                        className={`w-full px-4 py-3 border ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent`}
                        placeholder="Tu nombre"
                      />
                      {formErrors.firstName && <p className="mt-1 text-sm text-red-500">{formErrors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block font-inter text-sm font-medium text-gray-700 mb-2">
                        Apellidos *
                      </label>
                      <input
                        type="text"
                        value={customerData.lastName}
                        onChange={(e) => {
                          handleCustomerDataChange('lastName', e.target.value);
                          if (formErrors.lastName) setFormErrors(prev => ({ ...prev, lastName: undefined }));
                        }}
                        className={`w-full px-4 py-3 border ${formErrors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent`}
                        placeholder="Tus apellidos"
                      />
                      {formErrors.lastName && <p className="mt-1 text-sm text-red-500">{formErrors.lastName}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-inter text-sm font-medium text-gray-700 mb-2">
                        DNI *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={customerData.dni}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                            handleCustomerDataChange('dni', value);
                            if (formErrors.dni) setFormErrors(prev => ({ ...prev, dni: undefined }));
                          }}
                          className={`w-full pl-10 pr-4 py-3 border ${formErrors.dni ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent`}
                          placeholder="12345678"
                        />
                      </div>
                      {formErrors.dni && <p className="mt-1 text-sm text-red-500">{formErrors.dni}</p>}
                    </div>
                    <div>
                      <label className="block font-inter text-sm font-medium text-gray-700 mb-2">
                        Teléfono *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          value={customerData.phone}
                          onChange={(e) => {
                            handleCustomerDataChange('phone', e.target.value);
                            if (formErrors.phone) setFormErrors(prev => ({ ...prev, phone: undefined }));
                          }}
                          className={`w-full pl-10 pr-4 py-3 border ${formErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent`}
                          placeholder="+51 999 999 999"
                        />
                      </div>
                      {formErrors.phone && <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block font-inter text-sm font-medium text-gray-700 mb-2">
                      Dirección *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                      <textarea
                        value={customerData.address}
                        onChange={(e) => {
                          handleCustomerDataChange('address', e.target.value);
                          if (formErrors.address) setFormErrors(prev => ({ ...prev, address: undefined }));
                        }}
                        className={`w-full pl-10 pr-4 py-3 border ${formErrors.address ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-vertical`}
                        rows={3}
                        placeholder="Dirección completa para entrega"
                      />
                    </div>
                    {formErrors.address && <p className="mt-1 text-sm text-red-500">{formErrors.address}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-inter text-sm font-medium text-gray-700 mb-2">
                        Departamento *
                      </label>
                      <input
                        type="text"
                        value={customerData.department}
                        onChange={(e) => {
                          handleCustomerDataChange('department', e.target.value);
                          if (formErrors.department) setFormErrors(prev => ({ ...prev, department: undefined }));
                        }}
                        className={`w-full px-4 py-3 border ${formErrors.department ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent`}
                        placeholder="Lima"
                      />
                      {formErrors.department && <p className="mt-1 text-sm text-red-500">{formErrors.department}</p>}
                    </div>
                    <div>
                      <label className="block font-inter text-sm font-medium text-gray-700 mb-2">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        value={customerData.city}
                        onChange={(e) => {
                          handleCustomerDataChange('city', e.target.value);
                          if (formErrors.city) setFormErrors(prev => ({ ...prev, city: undefined }));
                        }}
                        className={`w-full px-4 py-3 border ${formErrors.city ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent`}
                        placeholder="Miraflores"
                      />
                      {formErrors.city && <p className="mt-1 text-sm text-red-500">{formErrors.city}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment Information */}
            {currentStep === 2 && (
              <div className="bg-white rounded-lg shadow-sm border border-beige-200 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-cream-200 rounded-full p-2">
                    <CreditCard className="h-5 w-5 text-gold-600" />
                  </div>
                  <h2 className="font-playfair text-2xl font-bold text-gray-900">
                    Método de Pago
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Payment Method Selection */}
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-cream-50 transition-colors duration-200">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="transfer"
                        checked={paymentData.method === 'transfer'}
                        onChange={(e) => handlePaymentDataChange('method', e.target.value as any)}
                        className="text-gold-500 focus:ring-gold-500"
                      />
                      <div className="ml-3">
                        <div className="font-inter font-medium text-gray-900">Transferencia Bancaria</div>
                        <div className="font-inter text-sm text-gray-500">Te enviaremos los datos bancarios por WhatsApp</div>
                      </div>
                    </label>

                    {paymentData.method === 'transfer' && (
                      <div className="ml-8 mt-2 p-4 bg-gray-50 rounded-md border border-gray-200">
                        <label className="block font-inter text-sm font-medium text-gray-700 mb-2">
                          Número de Cuotas
                        </label>
                        <select
                          value={paymentData.installments}
                          onChange={(e) => handlePaymentDataChange('installments', parseInt(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                        >
                          <option value="1">1 Cuota (Pago completo)</option>
                          <option value="2">2 Cuotas</option>
                          <option value="3">3 Cuotas</option>
                        </select>
                        <p className="mt-2 text-xs text-gray-500">
                          * El pago en cuotas está sujeto a evaluación y coordinación directa.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Error Message */}
                  {paymentError && (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <span className="font-inter text-sm text-red-700">{paymentError}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Order Confirmation */}
            {currentStep === 3 && (
              <div className="bg-white rounded-lg shadow-sm border border-beige-200 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-cream-200 rounded-full p-2">
                    <CheckCircle className="h-5 w-5 text-gold-600" />
                  </div>
                  <h2 className="font-playfair text-2xl font-bold text-gray-900">
                    Confirmar Pedido
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Customer Summary */}
                  <div className="p-4 bg-cream-50 rounded-lg border border-beige-200">
                    <h3 className="font-inter font-semibold text-gray-900 mb-3">Información de Entrega</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Nombre:</span> {customerData.firstName} {customerData.lastName}</p>
                      <p><span className="font-medium">DNI:</span> {customerData.dni}</p>
                      <p><span className="font-medium">Teléfono:</span> {customerData.phone}</p>
                      <p><span className="font-medium">Dirección:</span> {customerData.address}, {customerData.city}, {customerData.department}, {customerData.country}</p>
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className="p-4 bg-cream-50 rounded-lg border border-beige-200">
                    <h3 className="font-inter font-semibold text-gray-900 mb-3">Método de Pago</h3>
                    <p className="text-sm">
                      Transferencia Bancaria
                    </p>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 text-gold-500 focus:ring-gold-500 rounded"
                    />
                    <label htmlFor="terms" className="font-inter text-sm text-gray-600">
                      Acepto los{' '}
                      <a href="#" className="text-gold-600 hover:text-gold-700 underline">
                        términos y condiciones
                      </a>{' '}
                      y la{' '}
                      <a href="#" className="text-gold-600 hover:text-gold-700 underline">
                        política de privacidad
                      </a>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePreviousStep}
                disabled={currentStep === 1}
                className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Anterior</span>
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={handleNextStep}
                  disabled={
                    (currentStep === 2 && !validateStep2())
                  }
                  className="flex items-center space-x-2 bg-gold-500 hover:bg-gold-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
                >
                  <span>Siguiente</span>
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitOrder}
                  disabled={!agreedToTerms || isProcessing}
                  className="flex items-center space-x-2 bg-gold-500 hover:bg-gold-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-md font-medium transition-colors duration-200"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span>Confirmar Pedido</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-beige-200 p-6 sticky top-24">
              <h3 className="font-playfair text-xl font-bold text-gray-900 mb-6">
                Resumen del Pedido
              </h3>

              {/* Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-cream-50 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.mainImage}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-inter text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </h4>
                      <p className="font-inter text-xs text-gray-500">
                        Cantidad: {item.quantity}
                      </p>
                    </div>
                    <span className="font-inter text-sm font-bold text-gold-600">
                      ${(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-beige-200 pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="font-inter text-sm text-gray-600">Subtotal</span>
                  <span className="font-inter text-sm font-medium text-gray-900">
                    ${subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-beige-200">
                  <span className="font-playfair text-lg font-bold text-gray-900">Total</span>
                  <span className="font-playfair text-lg font-bold text-gold-600">
                    ${total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Security Features */}
              <div className="mt-6 pt-6 border-t border-beige-200">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="font-inter text-xs text-gray-600">Compra 100% segura</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-gold-500" />
                    <span className="font-inter text-xs text-gray-600">Garantía de calidad</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;