import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FinancialSummaryService {
  constructor(private http: HttpClient) {}

  getSummary({ apiUrl, params }: { apiUrl: string, params: any }): any {
    // Use Angular environment import for baseUrl
    return this.http.get(environment.apiUrl + apiUrl, { params });
  }
}
