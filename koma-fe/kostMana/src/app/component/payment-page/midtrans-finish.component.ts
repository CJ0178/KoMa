import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../service/booking.service';

@Component({
  selector: 'app-midtrans-finish',
  templateUrl: './midtrans-finish.component.html',
  styleUrls: ['./midtrans-finish.component.css']
})
export class MidtransFinishComponent {
  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private router: Router
  ) {
    this.route.queryParams.subscribe(params => {
      const order_id = params['order_id'];
      const transaction_status = params['transaction_status'];
      if (order_id && transaction_status) {
        this.bookingService.updateMidtransStatus(order_id, transaction_status).subscribe({
          next: () => {},
          error: () => {}
        });
      }
    });
  }
}
