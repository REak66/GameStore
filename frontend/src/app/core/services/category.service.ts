import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/api/categories`;
  private categoriesCache$: Observable<any> | null = null;

  constructor(private http: HttpClient) { }

  getCategories(): Observable<any> {
    if (!this.categoriesCache$) {
      this.categoriesCache$ = this.http.get(this.apiUrl).pipe(
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }
    return this.categoriesCache$;
  }

  invalidateCache(): void {
    this.categoriesCache$ = null;
  }

  getCategory(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createCategory(data: any): Observable<any> {
    this.invalidateCache();
    return this.http.post(this.apiUrl, data);
  }

  updateCategory(id: string, data: any): Observable<any> {
    this.invalidateCache();
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteCategory(id: string): Observable<any> {
    this.invalidateCache();
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
