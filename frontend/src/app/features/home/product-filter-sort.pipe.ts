import { Pipe, PipeTransform } from '@angular/core';
import { Product } from '../../core/models/product.model';

@Pipe({ name: 'productFilterSort' })
export class ProductFilterSortPipe implements PipeTransform {
  transform(products: Product[], category: string, sortOrder: string): Product[] {
    let list =
      category === 'all'
        ? [...products]
        : products.filter((p) => {
            const catId = typeof p.category === 'string' ? p.category : p.category?._id;
            return catId === category;
          });
    switch (sortOrder) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
    return list;
  }
}
