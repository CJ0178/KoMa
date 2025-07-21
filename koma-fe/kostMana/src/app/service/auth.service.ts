import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject: BehaviorSubject<any>;
  user$;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
    this.userSubject = new BehaviorSubject<any>(this.getUserFromStorage());
    this.user$ = this.userSubject.asObservable();
  }

  private getUserFromStorage() {
    if (isPlatformBrowser(this.platformId)) {
      const userDetailStr = localStorage.getItem('user_detail');
      return userDetailStr ? JSON.parse(userDetailStr) : null;
    }
    return null;
  }

  setUser(user: any) {
    if (isPlatformBrowser(this.platformId)) {
      if (user) {
        localStorage.setItem('user_detail', JSON.stringify(user));
      } else {
        localStorage.removeItem('user_detail');
        localStorage.removeItem('access_token');
      }
    }
    this.userSubject.next(user);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/login`, data);
  }

  logout(): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/logout`, {});
  }

  getCurrentUser() {
    const userDetailStr = localStorage.getItem('user_detail');
    return userDetailStr ? JSON.parse(userDetailStr) : null;
  }

  forgotPassword(email: string) {
    return this.http.post(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string, confirmPassword: string) {
    return this.http.post(`${environment.apiUrl}/auth/reset-password?token=${encodeURIComponent(token)}`, {
      newPassword,
      confirmPassword
    });
  }
}
