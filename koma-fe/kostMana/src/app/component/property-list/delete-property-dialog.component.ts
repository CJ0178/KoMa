import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-property-dialog',
  templateUrl: './delete-property-dialog.component.html',
  styleUrls: ['./delete-property-dialog.component.css']
})
export class DeletePropertyDialogComponent {
  title: string = 'Konfirmasi Hapus Properti';
  message: string = 'Yakin ingin menghapus properti ini?';
  constructor(
    public dialogRef: MatDialogRef<DeletePropertyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() public data?: any
  ) {}

  ngOnInit() {
    if(this.data){
      this.title = this.data.title || this.title;
      this.message = this.data.message || this.message;
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onDelete(): void {
    this.dialogRef.close(true);
  }
}
