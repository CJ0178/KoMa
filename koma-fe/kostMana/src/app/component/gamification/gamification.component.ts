import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Clipboard } from '@angular/cdk/clipboard';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-gamification',
  standalone: false,

  templateUrl: './gamification.component.html',
  styleUrl: './gamification.component.css'
})
export class GamificationComponent {
  shareLink : string = '';

  constructor(
    private dialogRef: MatDialogRef<GamificationComponent>,
    private clipboard: Clipboard,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    const baseUrl = window.location.origin;
    this.shareLink = data?.link ? `${baseUrl}/${data.link}` : '';
  }

  copyLink() {
    this.clipboard.copy(this.shareLink);
    alert('Link disalin!');
  }

  close() {
    this.dialogRef.close();
  }

}
