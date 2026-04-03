import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NewsletterService {
  private apiUrl = `${environment.apiUrl}/api/newsletter`;

  constructor(private http: HttpClient) {}

  subscribe(email: string) {
    return this.http.post<{ success: boolean; message: string }>(this.apiUrl, { email });
  }
}
