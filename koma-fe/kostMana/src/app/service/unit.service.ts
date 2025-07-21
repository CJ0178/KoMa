import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UnitService {
  constructor(private http: HttpClient) {}

  getUnitById(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/unit/${id}`);
  }

  createUnit(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/unit`, data);
  }

  updateUnit(id: any, data: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/unit/${id}`, data);
  }

  deleteUnit(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/unit/${id}`);
  }

  generateUnitLink(unitId: string | number) {
    return this.http.get(`${environment.apiUrl}/unit/generateLink/${unitId}`);
  }

  leaveUnit(propertyId: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/unit/leave`, { property_id: propertyId });
  }
}
