import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private http: HttpClient) {}

  getUserNotifications(): Observable<any> {
    return this.http.get(environment.apiUrl + '/notification/user');
  }

  createNotification(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/notification`, data);
  }

  updateNotification(id: number, payload: any) {
    return this.http.put(`${environment.apiUrl}/notification/${id}`, payload);
  }

  deleteNotification(id: number) {
    return this.http.delete(`${environment.apiUrl}/notification/${id}`);
  }
}
