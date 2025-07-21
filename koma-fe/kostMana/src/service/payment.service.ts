import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


declare var snap: any;

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://your-backend-api/generate-token';
  constructor(private http: HttpClient) {}

  getToken(orderData: any) {
    return this.http.post(this.apiUrl, orderData);
  }

  createTransaction() {
    const transactionData = {
      amount: 10000,
      items: [
        {
          id: 'item1',
          price: 10000,
          quantity: 1,
          name: 'Product Name'
        }
      ],
      customer_details: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '08123456789'
      }
    };

    return this.http.post<string>(this.apiUrl, transactionData);
  }

  initiatePayment(snapToken: string) {
    snap.pay(snapToken, {
      onSuccess: (result: any) => {
        console.log('Payment success', result);
      },
      onPending: (result: any) => {
        console.log('Payment pending', result);
      },
      onError: (error: any) => {
        console.log('Payment error', error);
      },
      onClose: () => {
        console.log('Payment popup closed without completing');
      }
    });
  }
}
