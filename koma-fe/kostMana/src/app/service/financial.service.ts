import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FinancialService {
  constructor(private http: HttpClient) {}

  addFinancialReport(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/financial`, data);
  }

  getFinancialByProperty(propertyId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/financial/property/${propertyId}`);
  }

  updateFinancialReport(id: number, data: any) {
    // PUT /financial/{id}
    return this.http.put(`${environment.apiUrl}/financial/${id}`, data);
  }

  deleteFinancialReport(id: number) {
    // DELETE /financial/{id}
    return this.http.delete(`${environment.apiUrl}/financial/${id}`);
  }
}
