import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PropertyServiceService {
  url = 'http://localhost:8080/kos/all';

  constructor(private http:HttpClient) { }

  public getAllKos():Observable<any>{
    return this.http.get<any>(this.url);
  }

  public getOwnerProperties(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/property/owner`);
  }
}
