import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ComplaintService {
  constructor(private http: HttpClient) {}

  createComplaint(data: FormData): Observable<any> {
    return this.http.post(`${environment.apiUrl}/complaint`, data);
  }

  getAllComplaints(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/complaint`);
  }

  getComplaintById(id: number | string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/complaint/${id}`);
  }

  updateComplaint(id: number | string, data: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/complaint/${id}`, data);
  }

  deleteComplaint(id: number | string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/complaint/${id}`);
  }

  setOnProgress(id: number | string): Observable<any> {
    return this.http.put(`${environment.apiUrl}/complaint/${id}/on-progress`, {});
  }

  setDone(id: number | string): Observable<any> {
    return this.http.put(`${environment.apiUrl}/complaint/${id}/done`, {});
  }
}
