import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-notif-dialog',
  standalone: false,

  templateUrl: './notif-dialog.component.html',
  styleUrl: './notif-dialog.component.css'
})
export class NotifDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<NotifDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  approve() {
    this.dialogRef.close('APPROVE');
  }
  reject() {
    this.dialogRef.close('REJECT');
  }
}
