import { Product } from './Product';

export interface OrderItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

export interface Order {
  id: string;
  created_at: string;
  order_code: string;
  customer_name: string;
  customer_dni: string;
  customer_phone: string;
  shipping_address: string;
  items: OrderItem[];
  total_amount: number;
  payment_method: string;
  installments?: number;
  status: 'Recibido' | 'Confirmado' | 'En proceso' | 'Entregado';
}
