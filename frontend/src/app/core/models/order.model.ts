import { Product } from './product.model';

export interface Order {
  _id: string;
  user: string | { name: string; email: string };
  orderItems: OrderItem[];
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  totalPrice: number;
  status: 'pending' | 'paid' | 'processing' | 'delivered' | 'cancelled';
  isPaid: boolean;
  paidAt?: string;
  trackingNumber?: string;
  createdAt: string;
}

export interface OrderItem {
  product:
  | string
  | (Pick<Product, '_id' | 'name' | 'image' | 'downloadLink'> & {
    downloadLink?: string;
  });
  name: string;
  image: string;
  price: number;
}
