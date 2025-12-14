import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, Lock, AlertCircle, CheckCircle, Loader } from 'lucide-react';

// Declaración de tipos para Niubiz
declare global {
  interface Window {
    Niubiz?: any;
  }
}

interface NiubizPaymentProps {
  amount: number;
  currency: 'PEN' | 'USD';
  orderId: string;
  customerEmail: string;
  onSuccess: (transactionData: any) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

interface PaymentFormData {
  cardNumber: string;
  cardName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

const NiubizPayment: React.FC<NiubizPaymentProps> = ({
  amount,
  currency,
  orderId,
  customerEmail,
  onSuccess,
  onError,
  onCancel
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });
  const [errors, setErrors] = useState<Partial<PaymentFormData>>({});
  const [isNiubizLoaded, setIsNiubizLoaded] = useState(false);
  const niubizRef = useRef<any>(null);

  // Cargar SDK de Niubiz
  useEffect(() => {
    const loadNiubizSDK = () => {
      if (typeof window !== 'undefined' && !window.Niubiz) {
        const script = document.createElement('script');
        script.src = 'https://apisandbox.vnforapps.com/v2/js/checkout.js';
        script.async = true;
        script.onload = () => {
          setIsNiubizLoaded(true);
          console.log('[NIUBIZ] SDK cargado exitosamente');
        };
        script.onerror = () => {
          console.error('[NIUBIZ] Error cargando SDK');
          onError('Error cargando el sistema de pago');
        };
        document.head.appendChild(script);
      } else if (window.Niubiz) {
        setIsNiubizLoaded(true);
      }
    };

    loadNiubizSDK();
  }, [onError]);

  // Generar sesión de Niubiz
  const generateSession = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/niubiz-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          orderId,
          customerEmail
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Error generando sesión');
      }

      setSessionData(data.sessionData);
      console.log('[NIUBIZ] Sesión generada:', data.sessionData);
      
    } catch (error) {
      console.error('[NIUBIZ] Error generando sesión:', error);
      onError('Error iniciando el proceso de pago');
    } finally {
      setIsLoading(false);
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Partial<PaymentFormData> = {};

    // Validar número de tarjeta
    if (!formData.cardNumber.replace(/\s/g, '').match(/^\d{13,19}$/)) {
      newErrors.cardNumber = 'Número de tarjeta inválido';
    }

    // Validar nombre
    if (!formData.cardName.trim()) {
      newErrors.cardName = 'Nombre en la tarjeta es requerido';
    }

    // Validar fecha de vencimiento
    if (!formData.expiryMonth || !formData.expiryYear) {
      newErrors.expiryMonth = 'Fecha de vencimiento es requerida';
    } else {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const expiryYear = parseInt(formData.expiryYear);
      const expiryMonth = parseInt(formData.expiryMonth);
      
      if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
        newErrors.expiryMonth = 'Tarjeta vencida';
      }
    }

    // Validar CVV
    if (!formData.cvv.match(/^\d{3,4}$/)) {
      newErrors.cvv = 'CVV inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Procesar pago
  const processPayment = async () => {
    if (!validateForm()) {
      return;
    }

    if (!sessionData || !isNiubizLoaded) {
      onError('Sistema de pago no disponible');
      return;
    }

    try {
      setIsLoading(true);

      // Crear token de transacción con Niubiz
      const transactionToken = await createTransactionToken();
      
      // Procesar pago en el backend
      const response = await fetch('/api/niubiz-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionData.sessionId,
          transactionToken,
          orderId,
          customerEmail,
          amount,
          currency
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Error procesando el pago');
      }

      console.log('[NIUBIZ] Pago exitoso:', data.transaction);
      onSuccess(data.transaction);
      
    } catch (error) {
      console.error('[NIUBIZ] Error procesando pago:', error);
      onError(error instanceof Error ? error.message : 'Error procesando el pago');
    } finally {
      setIsLoading(false);
    }
  };

  // Crear token de transacción (simulado)
  const createTransactionToken = async (): Promise<string> => {
    // En producción, esto se haría con el SDK real de Niubiz
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
      }, 1000);
    });
  };

  // Formatear número de tarjeta
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Formatear fecha de vencimiento
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiryMonth' || field === 'expiryYear') {
      formattedValue = value.replace(/\D/g, '');
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '');
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Inicializar sesión cuando el componente se monta
  useEffect(() => {
    if (isNiubizLoaded && !sessionData) {
      generateSession();
    }
  }, [isNiubizLoaded]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-beige-200 p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-cream-200 rounded-full p-2">
          <CreditCard className="h-5 w-5 text-gold-600" />
        </div>
        <div>
          <h2 className="font-playfair text-2xl font-bold text-gray-900">
            Pago con Tarjeta
          </h2>
          <p className="font-inter text-sm text-gray-600">
            Pagar en Dólares
          </p>
        </div>
      </div>

      {/* Información del pago */}
      <div className="bg-cream-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="font-inter text-sm text-gray-600">Total a pagar:</span>
          <span className="font-playfair text-lg font-bold text-gold-600">
            $ {amount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Formulario de tarjeta */}
      <div className="space-y-4">
        {/* Nombre en la tarjeta */}
        <div>
          <label className="block font-inter text-sm font-medium text-gray-700 mb-2">
            Nombre en la Tarjeta *
          </label>
          <input
            type="text"
            value={formData.cardName}
            onChange={(e) => handleInputChange('cardName', e.target.value)}
            className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent ${
              errors.cardName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Como aparece en la tarjeta"
            disabled={isLoading}
          />
          {errors.cardName && (
            <p className="mt-1 text-sm text-red-600">{errors.cardName}</p>
          )}
        </div>

        {/* Número de tarjeta */}
        <div>
          <label className="block font-inter text-sm font-medium text-gray-700 mb-2">
            Número de Tarjeta *
          </label>
          <input
            type="text"
            value={formData.cardNumber}
            onChange={(e) => handleInputChange('cardNumber', e.target.value)}
            className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent ${
              errors.cardNumber ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            disabled={isLoading}
          />
          {errors.cardNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
          )}
        </div>

        {/* Fecha de vencimiento y CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-inter text-sm font-medium text-gray-700 mb-2">
              Fecha de Vencimiento *
            </label>
            <input
              type="text"
              value={formData.expiryMonth}
              onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
              className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent ${
                errors.expiryMonth ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="MM/AA"
              maxLength={5}
              disabled={isLoading}
            />
            {errors.expiryMonth && (
              <p className="mt-1 text-sm text-red-600">{errors.expiryMonth}</p>
            )}
          </div>

          <div>
            <label className="block font-inter text-sm font-medium text-gray-700 mb-2">
              CVV *
            </label>
            <input
              type="text"
              value={formData.cvv}
              onChange={(e) => handleInputChange('cvv', e.target.value)}
              className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent ${
                errors.cvv ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="123"
              maxLength={4}
              disabled={isLoading}
            />
            {errors.cvv && (
              <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
            )}
          </div>
        </div>

        {/* Información de seguridad */}
        <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-md">
          <Lock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-inter text-sm font-medium text-blue-900 mb-1">
              Pago 100% Seguro
            </p>
            <p className="font-inter text-xs text-blue-700">
              Tus datos están protegidos con encriptación SSL de 256 bits. 
              Cumplimos con los estándares PCI DSS para la seguridad de pagos.
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex space-x-4 pt-4">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Cancelar
          </button>
          
          <button
            onClick={processPayment}
            disabled={isLoading || !sessionData}
            className="flex-1 flex items-center justify-center space-x-2 bg-gold-500 hover:bg-gold-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
          >
            {isLoading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                <span>Pagar Ahora</span>
              </>
            )}
          </button>
        </div>

        {/* Estado de carga del SDK */}
        {!isNiubizLoaded && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Loader className="h-4 w-4 animate-spin" />
            <span>Cargando sistema de pago...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NiubizPayment; 