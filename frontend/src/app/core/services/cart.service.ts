import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cart } from '../models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private apiUrl = `${environment.apiUrl}/api/cart`;
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  get cartCount(): number {
    return this.cartSubject.value?.items?.length || 0;
  }

  getCart(): Observable<any> {
    return this.http.get(this.apiUrl).pipe(
      tap((res: any) => {
        if (res.success) this.cartSubject.next(res.cart);
      }),
    );
  }

  addToCart(productId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, { productId }).pipe(
      tap((res: any) => {
        if (res.success) this.cartSubject.next(res.cart);
      }),
    );
  }

  removeFromCart(itemId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/item/${itemId}`).pipe(
      tap((res: any) => {
        if (res.success) this.cartSubject.next(res.cart);
      }),
    );
  }

  clearCart(): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/clear`)
      .pipe(tap(() => this.cartSubject.next(null)));
  }

  clearLocalCart(): void {
    this.cartSubject.next(null);
  }
}
