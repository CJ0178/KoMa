import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'https://your-backend-api/generate-token';

  constructor(private http: HttpClient) {}

  generatePaymentToken(orderDetails: any) {
    return this.http.post(this.apiUrl, orderDetails);
  }
}
