import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getUserById(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/user/${id}`);
  }

  updateUser(id: number, payload: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/user/update/${id}`, payload);
  }

  updatePassword(payload: { oldPassword: string, newPassword: string }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/user/update-password`, payload);
  }
}
