import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../service/alert.service';

@Component({
  selector: 'app-use-point-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  template: `
    <h2 mat-dialog-title>Gunakan Poin</h2>
    <mat-dialog-content>
      <p>Poin Anda: <strong>{{data.accumulatedPoint}}</strong></p>
      <p>Total Pembayaran: <strong>Rp {{data.totalAmount | number}}</strong></p>
      <mat-radio-group [(ngModel)]="option" class="vertical-radio-group">
        <div class="radio-wrapper">
          <mat-radio-button value="max">Gunakan maksimal poin (hingga 50%)</mat-radio-button>
        </div>
        <div class="radio-wrapper">
          <mat-radio-button value="custom">Gunakan jumlah poin tertentu</mat-radio-button>
          <div *ngIf="option === 'custom'" class="custom-point-input">
            <mat-form-field appearance="outline">
              <input matInput type="number" [(ngModel)]="customPoint" [max]="maxPoint" [min]="0" placeholder="Masukkan poin" />
            </mat-form-field>
            <small>Maksimal: {{maxPoint}}</small>
          </div>
        </div>
        <div class="radio-wrapper">
          <mat-radio-button value="none">Tidak gunakan poin</mat-radio-button>
        </div>
      </mat-radio-group>
      <div *ngIf="option === 'custom' || option === 'max'">
        <p>Total akhir pembayaran: <strong>Rp {{data.totalAmount - getUsedPoint() | number}}</strong></p>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Batal</button>
      <button mat-raised-button color="primary" (click)="onConfirm()">Gunakan</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .mat-dialog-content {
      font-size: 15px;
      color: #2d3142;
      padding-bottom: 18px;
      background: #fff;
    }
    .mat-dialog-title {
      font-size: 20px;
      font-weight: 700;
      color: #2d3142;
      margin-bottom: 12px;
      letter-spacing: 0.5px;
    }
    .vertical-radio-group {
      display: flex;
      flex-direction: column;
      gap: 0;
    }
    .radio-wrapper {
      margin-bottom: 12px;
      width: 100%;
      display: block;
    }
    .mat-radio-button {
      font-size: 15px;
      color: #4f5d75;
      width: 100%;
      display: block !important;
    }
    .custom-point-input {
      margin-top: 8px;
      width: 220px;
      max-width: 100%;
      margin-left: 32px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    .custom-point-input mat-form-field {
      width: 220px;
      max-width: 100%;
      margin-top: 0;
      background: #f7f7fa;
      border-radius: 6px;
    }
    .mat-dialog-actions {
      margin-top: 18px;
      justify-content: flex-end;
      background: #fff;
      border-top: 1px solid #e0e7ef;
      padding-top: 12px;
    }
    button[mat-button], button[mat-raised-button] {
      min-width: 110px;
      font-size: 15px;
      border-radius: 6px;
      margin-left: 8px;
    }
    small {
      color: #7a7a7a;
      font-size: 13px;
      margin-left: 4px;
    }
    p {
      margin: 0 0 8px 0;
    }
  `]
})
export class UsePointDialogComponent {
  option: 'none' | 'max' | 'custom' = 'max';
  customPoint: number = 0;
  maxPoint: number;

  constructor(
    public dialogRef: MatDialogRef<UsePointDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { accumulatedPoint: number, totalAmount: number },
    private alertService: AlertService
  ) {
    this.maxPoint = Math.floor(Math.min(data.accumulatedPoint, data.totalAmount * 0.5));
  }

  onCancel() {
    this.dialogRef.close();
  }

  onConfirm() {
    let usedPoint = 0;
    if (this.option === 'max') {
      usedPoint = this.maxPoint;
    } else if (this.option === 'custom') {
      usedPoint = Math.min(this.customPoint, this.maxPoint);
      if (usedPoint > this.maxPoint) {
        this.alertInvalidPoint();
        return;
      }
    }
    // If 'none', usedPoint remains 0
    this.dialogRef.close(usedPoint);
  }

  alertInvalidPoint() {
    this.alertService.error('Jumlah poin yang digunakan tidak boleh melebihi 50% dari total pembayaran.');
  }

  getUsedPoint(): number {
    if (this.option === 'max') {
      return this.maxPoint;
    } else if (this.option === 'custom') {
      return Math.min(this.customPoint, this.maxPoint);
    }
    return 0;
  }
}
