import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';

import { NotificationService } from '../../service/notification.service';
import { BookingService } from '../../service/booking.service';
import { PropertyService } from '../../service/property.service';
import { AlertService } from '../../service/alert.service';
import { NotifDialogComponent } from '../pop-up/notif-dialog/notif-dialog.component';
import { AuthService } from '../../service/auth.service';
import { UnitService } from '../../service/unit.service';
import { AddNotificationDialogComponent } from '../pop-up/add-notification-dialog.component';
import { ConfirmDeleteDialog } from '../pop-up/confirm-delete-dialog.component';

interface Notification {
  id?: number;
  user_id?: number;
  property_id?: number;
  unit_id?: number;
  billing_id?: number;
  notification_category?: string;
  content?: string;
  user_detail?: any;
  user_create?: string;
  date_create?: string;
  date_update?: string;
  // Existing fields for compatibility
  title?: string;
  bookingId?: number;
  keeperId?: number;
  allow_approve?: boolean; // New field to indicate if approval is allowed
  status_approve?: string; // New field to indicate if approval is allowed
  // Add any other fields from NotificationDTO as needed
}

@Component({
  selector: 'app-notification',
  standalone: false,

  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];
  isPemilik: boolean = false;
  isPenjaga: boolean = false;
  propertyList: any[] = [];
  userEmail: string = '';

  constructor(
    private notificationService: NotificationService,
    private bookingService: BookingService,
    private propertyService: PropertyService,
    private unitService: UnitService,
    private authService: AuthService,
    private dialog: MatDialog,
    private alertService: AlertService
  ) {
    this.authService.user$.subscribe(user => {
      this.isPemilik = user && user.role_id === 2;
      this.isPenjaga = user && user.role_id === 3;
      this.userEmail = user?.email || '';
    });
  }

  ngOnInit(): void {
    this.notificationService.getUserNotifications().subscribe({
      next: (res) => {
        if (res && res.success && Array.isArray(res.data)) {
          this.notifications = res.data.map((item: any) => ({
            id: item.id,
            user_id: item.user_id,
            property_id: item.property_id,
            unit_id: item.unit_id,
            billing_id: item.billing_id,
            notification_category: item.notification_category,
            content: item.content || item.message || '-',
            user_detail: item.user_detail,
            user_create: item.user_create,
            date_create: item.date_create,
            date_update: item.date_update,
            // Compatibility/legacy fields
            title: item.notification_category || '-',
            bookingId: item.booking_id || item.billing_id || undefined,
            keeperId: item.property_keeper_id || undefined,
            allow_approve: item.allow_approve || false,
            status_approve: item.status_approve || 'PENDING'
          }));
        }
      },
      error: (err) => {
        this.notifications = [];
      }
    });
  }

  onApproveBooking(notification: Notification) {
    const dialogRef = this.dialog.open(NotifDialogComponent, {
      data: notification
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'APPROVE' || result === 'REJECT') {
        if (notification.bookingId) {
          this.bookingService.approveBooking(notification.bookingId, result).subscribe({
            next: (res) => {
              this.alertService.success((res as any)?.message || 'Booking berhasil disetujui!');
              this.ngOnInit(); // reload layar
            },
            error: (err) => {
              this.alertService.error((err?.error as any)?.message || 'Gagal menyetujui booking.');
            }
          });
        }
      }
    });
  }

  onApproveKeeper(notification: Notification) {
    const dialogRef = this.dialog.open(NotifDialogComponent, {
      data: notification
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'APPROVE' || result === 'REJECT') {
        if (notification.keeperId) {
          this.propertyService.approveKeeper(notification.keeperId, result).subscribe({
            next: (res) => {
              this.alertService.success((res as any)?.message || 'Approval penjaga berhasil!');
              this.ngOnInit(); // reload layar
            },
            error: (err) => {
              this.alertService.error((err?.error as any)?.message || 'Gagal approval penjaga.');
            }
          });
        }
      }
    });
  }

  openAddNotificationDialog() {
    this.propertyService.getOwnerProperties().subscribe(res => {
      if (res && res.success && Array.isArray(res.data)) {
        this.propertyList = res.data.map((p: any) => ({
          id: p.id,
          property_name: p.property_name,
          units: Array.isArray(p.units) ? p.units.map((u: any) => ({ id: u.id, unit_name: u.unit_name })) : []
        }));
        const dialogRef = this.dialog.open(AddNotificationDialogComponent, {
          width: '500px',
          data: { propertyList: this.propertyList }
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.notificationService.createNotification(result).subscribe({
              next: (res) => {
                this.alertService.success((res as any)?.message || 'Notifikasi berhasil dikirim!');
              },
              error: (err) => {
                this.alertService.error((err?.error as any)?.message || 'Gagal mengirim notifikasi.');
              }
            });
          }
        });
      }
    });
  }

  onEditNotification(notification: any) {
    this.propertyService.getOwnerProperties().subscribe(res => {
      if (res && res.success && Array.isArray(res.data)) {
        this.propertyList = res.data.map((p: any) => ({
          id: p.id,
          property_name: p.property_name,
          units: Array.isArray(p.units) ? p.units.map((u: any) => ({ id: u.id, unit_name: u.unit_name })) : []
        }));
        // Find units for the selected property
        const selectedProperty = this.propertyList.find(p => p.id === notification.property_id);
        const dialogRef = this.dialog.open(AddNotificationDialogComponent, {
          width: '420px',
          data: {
            isEditMode: true,
            propertyList: this.propertyList,
            notification: notification
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            // Build payload according to NotificationDTO
            const payload = {
              user_id: notification.user_id,
              property_id: result.property_id,
              unit_id: result.unit_id,
              billing_id: notification.billing_id,
              notification_category: result.notification_category,
              content: result.content
            };
            this.notificationService.updateNotification(notification.id, payload).subscribe({
              next: (res) => {
                this.alertService.success((res as any)?.message || 'Notifikasi berhasil diupdate!');
              },
              error: (err) => {
                this.alertService.error((err?.error as any)?.message || 'Gagal mengupdate notifikasi.');
              }
            });
          }
        });
      }
    });
  }

  onDeleteNotification(notification: any) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialog, {
      width: '320px',
      data: { message: 'Yakin ingin menghapus notifikasi ini?' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.notificationService.deleteNotification(notification.id).subscribe({
          next: (res) => {
            this.alertService.success((res as any)?.message || 'Notifikasi berhasil dihapus!');
            this.ngOnInit();
          },
          error: (err) => {
            this.alertService.error((err?.error as any)?.message || 'Gagal menghapus notifikasi.');
          }
        });
      }
    });
  }

  isAllowAdd(){
    return this.isPemilik || this.isPenjaga;
  }
}
