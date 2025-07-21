import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-rating-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
  <div class="rating-container">
    <h2 class="dialog-title">Berikan Rating Properti</h2>
    <div class="stars">
      <span *ngFor="let star of [1,2,3,4,5]" (click)="setRating(star)">
        <mat-icon [ngClass]="star <= rating ? 'star-filled' : 'star-empty'">star</mat-icon>
      </span>
    </div>
    <button class="submit-btn" (click)="submit()" [disabled]="rating === 0">Kirim Rating</button>
  </div>
  `,
  styles: [`
    .rating-container { margin: 0 auto; padding: 24px; }
    .dialog-title { text-align: center; margin-bottom: 18px; }
    .stars { font-size: 32px; margin: 16px 0; text-align: center; }
    .star-filled { color: #FFD600; cursor: pointer; }
    .star-empty { color: #E0E0E0; cursor: pointer; }
    .submit-btn { display: block; margin: 0 auto; margin-top: 18px; background: #4f5d75; color: #fff; border: none; border-radius: 6px; padding: 10px 22px; font-size: 16px; cursor: pointer; }
    .submit-btn:disabled { background: #b0b7c3; cursor: not-allowed; }
  `]
})
export class RatingDialogComponent {
  rating = 0;
  setRating(star: number) { this.rating = star; }
  constructor(public dialogRef: MatDialogRef<RatingDialogComponent>) {}
  submit() { this.dialogRef.close(this.rating); }
}
