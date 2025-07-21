import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../../../service/api.service';
import { PaymentService } from '../../../../service/payment.service';

declare global {
  interface Window {
    snap: {
      embed: (
        token: string,
        options: {
          embedId: string;
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
      pay: (token: string, options?: any) => void;
    };
  }
}

@Component({
  selector: 'app-pop-up-midtrans',
  standalone: false,

  templateUrl: './pop-up-midtrans.component.html',
  styleUrl: './pop-up-midtrans.component.css'
})

export class PopUpMidtransComponent {
  customer = { name: '', email: '', phone: '' };
  amount = 0;
  loading = false;
  error = '';
  token: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PopUpMidtransComponent>
  ) {
    this.token = data?.token;
    if (this.token) {
      setTimeout(() => {
        window.snap.pay(this.token, {
          onSuccess: (result: any) => {
            this.dialogRef.close(result);
          },
          onPending: (result: any) => {},
          onError: (result: any) => {},
          onClose: () => {}
        });
      }, 300);
    }
  }

  payButton(){
    if (this.token) {
      window.snap.pay(this.token);
    }
  }
}
