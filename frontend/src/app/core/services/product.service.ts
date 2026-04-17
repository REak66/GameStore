import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProductFilter } from '../models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = `${environment.apiUrl}/api/products`;
  private featuredCache$: Observable<any> | null = null;

  constructor(private http: HttpClient) { }

  getProducts(filter: ProductFilter = {}): Observable<any> {
    let params = new HttpParams();
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });
    return this.http.get(this.apiUrl, { params });
  }

  getProduct(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getFeaturedProducts(): Observable<any> {
    if (!this.featuredCache$) {
      this.featuredCache$ = this.http.get(`${this.apiUrl}/featured`).pipe(
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }
    return this.featuredCache$;
  }

  createProduct(data: FormData): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateProduct(id: string, data: FormData | any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  addReview(
    id: string,
    data: { rating: number; comment: string },
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/reviews`, data);
  }
}
