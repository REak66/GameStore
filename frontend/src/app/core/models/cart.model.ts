import { Product } from './product.model';

export interface CartItem {
  _id: string;
  product: Product | string;
  price: number;
}

export interface Cart {
  _id?: string;
  user: string;
  items: CartItem[];
  totalPrice: number;
}
