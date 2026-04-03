export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images?: string[];
  category: { _id: string; name: string } | string;
  status: 'active' | 'inactive';
  rating: number;
  numReviews: number;
  featured: boolean;
  reviews?: Review[];
  createdAt: string;
  downloadLink?: string;
  downloadCount?: number;
}

export interface Review {
  _id: string;
  user: string | { name: string; avatar?: string };
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductFilter {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  status?: string;
}
