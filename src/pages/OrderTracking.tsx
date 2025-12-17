import React, { useState } from 'react';
import SEO from '../components/SEO';
import { Search, Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface OrderStatus {
  order_code: string;
  status: 'Recibido' | 'Confirmado' | 'En proceso' | 'Entregado';
  customer_name: string;
  total_amount: number;
  created_at: string;
}

const OrderTracking: React.FC = () => {
  const [orderCode, setOrderCode] = useState('');
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCode.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('order_code, status, customer_name, total_amount, created_at')
        .eq('order_code', orderCode.trim())
        .single();

      if (error) throw error;

      if (data) {
        setOrder(data as OrderStatus);
      } else {
        setError('No se encontró ningún pedido con ese código.');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('No se encontró el pedido o hubo un error en la búsqueda.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'Recibido': return 1;
      case 'Confirmado': return 2;
      case 'En proceso': return 3;
      case 'Entregado': return 4;
      default: return 0;
    }
  };

  const currentStep = order ? getStatusStep(order.status) : 0;

  return (
    <div className="min-h-screen bg-cream-25 pt-24 pb-12">
      <SEO title="Seguimiento de Pedido" description="Consulta el estado de tu pedido" url="/tracking" noindex />

      {/* Hero */}
      <section className="relative overflow-hidden mb-10">
        <div className="absolute inset-0 bg-gradient-to-r from-gold-500 via-gold-600 to-gold-700 opacity-95"></div>
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center opacity-10"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-white">
          <p className="uppercase tracking-[0.2em] text-xs font-semibold mb-3 text-white/80">Estado en línea</p>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold leading-tight mb-3">
            Seguimiento de tu pedido
          </h1>
          <p className="font-inter text-lg text-cream-50 max-w-3xl">
            Ingresa tu código y revisa el avance de preparación, envío y entrega con una vista clara y rápida.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Search Box */}
        <div className="bg-white rounded-lg shadow-md border border-gold-100 ring-1 ring-gold-50 p-8 mb-8 transition-shadow duration-200">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
                placeholder="Ej: ORD-123456"
                className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent font-inter uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-gold-500 hover:bg-gold-600 text-white px-8 py-3 rounded-md font-medium transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  <span>Buscar</span>
                </>
              )}
            </button>
          </form>
          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-md flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Order Status Result */}
        {order && (
          <div className="bg-white rounded-lg shadow-md border border-gold-100 ring-1 ring-gold-50 p-8 animate-fade-in">
            <div className="flex justify-between items-start mb-8 border-b border-beige-100 pb-6">
              <div>
                <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-2">
                  Pedido #{order.order_code}
                </h2>
                <p className="text-gray-500 font-inter text-sm">
                  Realizado el {new Date(order.created_at).toLocaleDateString('es-PE')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-inter text-sm text-gray-500">Total</p>
                <p className="font-playfair text-xl font-bold text-gold-600">
                  $ {order.total_amount.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="relative">
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-gold-500 -z-10 transition-all duration-1000" style={{ width: `${((currentStep - 1) / 3) * 100}%` }}></div>
              
              <div className="flex justify-between">
                {[
                  { step: 1, label: 'Recibido', icon: Package },
                  { step: 2, label: 'Confirmado', icon: CheckCircle },
                  { step: 3, label: 'En proceso', icon: Clock },
                  { step: 4, label: 'Entregado', icon: Truck },
                ].map((s) => {
                  const Icon = s.icon;
                  const isActive = currentStep >= s.step;
                  const isCurrent = currentStep === s.step;
                  
                  return (
                    <div key={s.step} className="flex flex-col items-center bg-white px-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                        isActive 
                          ? 'bg-gold-500 border-gold-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`mt-2 text-sm font-medium ${
                        isActive ? 'text-gold-600' : 'text-gray-400'
                      }`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-10 p-4 bg-cream-50 rounded-lg border border-beige-200">
              <h3 className="font-inter font-semibold text-gray-900 mb-2">Estado Actual: {order.status}</h3>
              <p className="text-sm text-gray-600">
                {order.status === 'Recibido' && 'Hemos recibido tu pedido y estamos verificando el pago.'}
                {order.status === 'Confirmado' && 'Tu pago ha sido verificado. Estamos preparando tus joyas.'}
                {order.status === 'En proceso' && 'Tu pedido está siendo empaquetado y preparado para el envío.'}
                {order.status === 'Entregado' && '¡Tu pedido ha sido entregado! Esperamos que lo disfrutes.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
