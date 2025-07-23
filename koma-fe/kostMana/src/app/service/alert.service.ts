import { Injectable } from '@angular/core';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class AlertService {
  constructor(private toast: ToastService) {}

  success(message: string) {
    this.toast.show(message, 'success');
  }

  error(message: string) {
    this.toast.show(message, 'error');
  }
}
