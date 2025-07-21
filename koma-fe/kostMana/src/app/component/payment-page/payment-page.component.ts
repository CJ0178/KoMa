import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PopUpMidtransComponent } from '../pop-up/pop-up-midtrans/pop-up-midtrans.component';
import { DatePipe } from '@angular/common';
import { SelectionModel } from '@angular/cdk/collections';
import { BookingService } from '../../service/booking.service';
import { AlertService } from '../../service/alert.service';
import { UsePointDialogComponent } from './use-point-dialog.component';
import { UserService } from '../../service/user.service';
import { AuthService } from '../../service/auth.service';

interface Bill {
  booking_id: number;
  month: string;
  year: string;
  dueDate: Date;
  amount: number;
  status: string;
  daysLate?: number;
  reference_no?: string;
  multipay_reference_no?: string;
  billing_type?: string;
  last_midtrans_status?: string;
  // ...other fields from BillingDetailDTO
}

@Component({
  selector: 'app-payment-page',
  standalone: false,

  templateUrl: './payment-page.component.html',
  styleUrl: './payment-page.component.css'
})
export class PaymentPageComponent implements OnInit {
  src="https://app.sandbox.midtrans.com/snap/snap.js"
  dataClientKey="SB-Mid-client-q7B-ww2fj54K6UWS"
  selectedTab: string = 'OnGoing';


  selectionT1 = new SelectionModel<Bill>(true, []);
  isLoading: boolean = false;

  constructor(
    public dialog: MatDialog,
    private datePipe: DatePipe,
    private bookingService: BookingService,
    private alertService: AlertService,
    private userService: UserService,
    private authService: AuthService
  ) {}
  onGoingBills: Bill[] = [];
  DoneBills: Bill[] = [];
  total = 0;
  selected = 0;

   bills: Bill[] = [];

  accumulatedPoint: number = 0;

  transformDate(date: any, format: string = 'EEE, dd MMMM yyyy'):any{
    return this.datePipe.transform(date, format);
  }

  payButton() {
    const selectedBills = this.selectionT1.selected.filter(bill => bill.billing_type === 'BOOKING' || bill.billing_type === 'MONTHLY_BILL');
    if (selectedBills.length === 0) return;
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.user_id) {
      this.alertService.error('User tidak ditemukan.');
      return;
    }
    this.isLoading = true;
    this.userService.getUserById(currentUser.user_id).subscribe((userRes: any) => {
      const accumulatedPoint = userRes?.data?.accumulated_point || 0;
      const totalAmount = selectedBills.reduce((sum, bill) => sum + bill.amount, 0);
      const dialogRef = this.dialog.open(UsePointDialogComponent, {
        data: { accumulatedPoint, totalAmount }
      });
      dialogRef.afterClosed().subscribe((usedPoint: number) => {
        if (usedPoint === undefined) { this.isLoading = false; return; }
        // Separate bills by type
        const bookingBills = selectedBills.filter(bill => bill.billing_type === 'BOOKING');
        const monthlyBills = selectedBills.filter(bill => bill.billing_type === 'MONTHLY_BILL');
        // Pay booking bills
        let bookingCount = bookingBills.length;
        let monthlyDone = false;
        bookingBills.forEach(bill => {
          this.bookingService.payBooking(bill.booking_id, usedPoint).subscribe({
            next: (res) => {
              this.alertService.success((res as any)?.message || 'Pembayaran berhasil!');
              if (res && res.data) {
                window.snap.pay(res.data);
              }
              bookingCount--;
              if (bookingCount === 0 && monthlyDone) this.isLoading = false;
            },
            error: (err) => {
              this.alertService.error((err?.error as any)?.message || 'Gagal melakukan pembayaran.');
              bookingCount--;
              if (bookingCount === 0 && monthlyDone) this.isLoading = false;
            }
          });
        });
        // Pay monthly bills
        if (monthlyBills.length > 0) {
          const monthlyIds = monthlyBills.map(bill => bill.booking_id);
          this.bookingService.payMonthlyBills(monthlyIds, usedPoint).subscribe({
            next: (res) => {
              this.alertService.success((res as any)?.message || 'Pembayaran tagihan bulanan berhasil!');
              if (res && res.data) {
                window.snap.pay(res.data);
              }
              monthlyDone = true;
              if (bookingCount === 0) this.isLoading = false;
            },
            error: (err) => {
              this.alertService.error((err?.error as any)?.message || 'Gagal melakukan pembayaran bulanan.');
              monthlyDone = true;
              if (bookingCount === 0) this.isLoading = false;
            }
          });
        } else {
          monthlyDone = true;
          if (bookingCount === 0) this.isLoading = false;
        }
      });
    }, () => { this.isLoading = false; });
  }

  selectAllCheck(){
    this.isAllSelected()?
    this.selectionT1.clear() :
    this.onGoingBills.forEach(rows => this.selectionT1.select(rows))
  }

  clearAllCheck(){
    this.selectionT1.clear();
  }

  sumTotal(status:any, bill: any){
    this.selected = this.selectionT1.selected.length
    console.log(this.selected > 0? 'yea':'naw')
    if(status.checked == true) this.total += bill.amount;
    else this.total -= bill.amount;
  }

  isAllSelected(){
    const numSelected = this.selectionT1.selected.length;
    const numRows = this.onGoingBills.length;

    return numSelected === numRows;
  }

  ngOnInit() {
    this.isLoading = true;
    this.bookingService.getOccupantBillings().subscribe((res: any) => {
      if (res && res.success && Array.isArray(res.data)) {
        const bills = res.data.map((item: any) => {
          const due = new Date(item.due_date);
          const month = due.toLocaleString('id-ID', { month: 'long' });
          const year = due.getFullYear().toString();
          return {
            booking_id: item.booking_id,
            month,
            year,
            dueDate: this.transformDate(item.due_date, 'dd MMMM yyyy'),
            amount: item.nominal,
            status: item.status_billing,
            reference_no: item.reference_no,
            multipay_reference_no: item.multipay_reference_no,
            billing_type: item.billing_type,
            last_midtrans_status: item.last_midtrans_status,
            daysLate: item.daysLate || 0,
            ...item
          };
        });
        this.onGoingBills = bills.filter((b: any) => b.status === 'PENDING_PAYMENT');
        this.DoneBills = bills.filter((b: any) => b.status === 'PAYMENT_FAILED' || b.status === 'PAID');
      }
      this.isLoading = false;
    }, err => {
      this.alertService.error((err?.error as any)?.message || 'Gagal mengambil tagihan.');
      this.isLoading = false;
    });
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'BOOKING_REQUEST': return 'unpaid';
      case 'BOOKING_REJECTED': return 'rejected';
      case 'PENDING_PAYMENT': return 'unpaid';
      case 'PAYMENT_FAILED': return 'late';
      case 'PAID': return 'paid';
      default: return '';
    }
  }

  changeTab(tab: string) {
    this.selectedTab = tab;
  }

  toggleBillSelection(bill: Bill) {
    if (this.selectionT1.isSelected(bill)) {
      this.selectionT1.deselect(bill);
      this.total -= bill.amount;
    } else {
      this.selectionT1.select(bill);
      this.total += bill.amount;
    }
    this.selected = this.selectionT1.selected.length;
  }
}
