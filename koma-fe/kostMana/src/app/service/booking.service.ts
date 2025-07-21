import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BookingService {
  constructor(private http: HttpClient) {}

  createBooking(unit_id: number, ref?: string | null): Observable<any> {
    let url = environment.apiUrl + '/billing';
    if (ref) {
      url += `?ref=${encodeURIComponent(ref)}`;
    }
    return this.http.post(url, { unit_id });
  }

  /**
   * Approve or reject a booking (billing) by id using API-spec
   * @param billingId The billing id
   * @param decision 'APPROVE' or 'REJECT'
   * @param remarks Optional remarks
   */
  approveBooking(billingId: number, decision: 'APPROVE' | 'REJECT', remarks: string = ''): Observable<any> {
    return this.http.put(`${environment.apiUrl}/billing/${billingId}/approval`, {
      decision,
      remarks
    });
  }

  /**
   * Get all bookings (billings) for the current occupant
   */
  getOccupantBillings(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/billing/occupant`);
  }

  /**
   * Pay a booking (billing) by id using API-spec
   * @param billingId The billing id
   */
  payBooking(billingId: number, usedPoint?: number): Observable<any> {
    let url = `${environment.apiUrl}/billing/${billingId}/payment`;
    if (usedPoint !== undefined) {
      url += `?used_point=${usedPoint}`;
    }
    return this.http.put(url, {});
  }

  /**
   * Update midtrans payment status
   */
  updateMidtransStatus(order_id: string, transaction_status: string): Observable<any> {
    return this.http.put(`${environment.apiUrl}/billing/midtrans/status?order_id=${order_id}&transaction_status=${transaction_status}`, {});
  }

  /**
   * Pay monthly bill(s) by id(s) using API-spec
   * @param ids Array of monthly bill ids
   * @param usedPoint Optional used point
   */
  payMonthlyBills(ids: number[], usedPoint?: number): Observable<any> {
    let url = `${environment.apiUrl}/billing/monthly/bill/payment?id=${ids.join(',')}`;
    if (usedPoint !== undefined) {
      url += `&used_point=${usedPoint}`;
    }
    return this.http.put(url, {});
  }
}
