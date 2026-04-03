export interface User {
  id: string;
  name: string;
  email: string;
  role: 'guest' | 'customer' | 'admin';
  phone?: string;
  address?: Address;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}
