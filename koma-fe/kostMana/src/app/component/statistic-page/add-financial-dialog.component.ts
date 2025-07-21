import { Component, Inject, Optional, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PropertyService } from '../../service/property.service';
import { FinancialService } from '../../service/financial.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../service/auth.service';
import { CloudinaryService } from '../../service/cloudinary.service';

@Component({
  selector: 'app-add-financial-dialog',
  standalone: false,
  templateUrl: './add-financial-dialog.component.html',
  styleUrls: ['./add-financial-dialog.component.css']
})
export class AddFinancialDialogComponent implements OnInit {
  financialForm: FormGroup;
  properties: any[] = [];
  units: any[] = [];
  selectedProperty: any = null;
  type: string | null = null;
  isLoading: boolean = false;
  mode: 'add' | 'edit' = 'add';
  editId: number | null = null;
  userRole: string = '';
  userEmail: string = '';
  userDetail: any;
  financialPhotoFile: File | null = null;
  financialPhotoPreview: string | ArrayBuffer | null = null;
  selectedFiles: File[] = [];
  previewUrls: string[] = [];

  constructor(
    private fb: FormBuilder,
    private propertyService: PropertyService,
    private route: ActivatedRoute,
    private router: Router,
    private financialService: FinancialService,
    private authService: AuthService,
    private cloudinaryService: CloudinaryService, // tambahkan dependency
    @Optional() public dialogRef?: MatDialogRef<AddFinancialDialogComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() public data?: any
  ) {
    this.financialForm = this.fb.group({
      property_id: [null, Validators.required],
      unit_id: [null, Validators.required],
      nominalPemasukan: [null, [Validators.required, Validators.min(0)]],
      nominalPengeluaran: [null, [Validators.required, Validators.min(0)]],
      deskripsi: ['', Validators.required],
      tanggal: [null, Validators.required],
      financial_photo_path: ['']
    });
    this.authService.user$.subscribe(user => {
      this.userRole = user && user.role_id === 2 ? 'pemilik' : (user && user.role_id === 3 ? 'penjaga' : '');
      this.userEmail = user?.email || '';
      this.userDetail = user;
    });
    this.loadProperties();
    // If opened in edit mode via dialog
    if (data && data.mode === 'edit') {
      this.mode = 'edit';
      this.editId = data.id;
      this.type = data.type || null;
      this.financialForm.patchValue({
        property_id: data.property_id ?? null,
        unit_id: null, // will set after units loaded
        nominalPemasukan: data.income ?? 0,
        nominalPengeluaran: data.expense ?? 0,
        deskripsi: data.description ?? '',
        tanggal: data.date ?? null
      });
      // Disable fields based on type
      if (this.type === 'income') {
        this.financialForm.get('nominalPengeluaran')?.disable();
        this.financialForm.get('nominalPengeluaran')?.setValue(0);
      } else if (this.type === 'expense') {
        this.financialForm.get('nominalPemasukan')?.disable();
        this.financialForm.get('nominalPemasukan')?.setValue(0);
      }
      // Load units for selected property and set unit_id after units loaded
      this.propertyService.getPropertyById(data.property_id).subscribe((res: any) => {
        if (res.data && res.data.units) {
          this.units = res.data.units;
        } else if (res.units) {
          this.units = res.units;
        } else {
          this.units = [];
        }
        // Set unit_id after units loaded
        this.financialForm.get('unit_id')?.setValue(data.unit_id ?? null);
      });
    }
  }

  ngOnInit() {
    // Get type from query params for add mode
    if (this.mode !== 'edit') {
      this.route.queryParams.subscribe(params => {
        this.type = params['type'] || null;
        if (this.type === 'income') {
          this.financialForm.get('nominalPengeluaran')?.disable();
          this.financialForm.get('nominalPengeluaran')?.setValue(0);
        } else if (this.type === 'expense') {
          this.financialForm.get('nominalPemasukan')?.disable();
          this.financialForm.get('nominalPemasukan')?.setValue(0);
        }
      });
    }
  }

  loadProperties() {
    if (this.userRole === 'penjaga') {
      // Penjaga: fetch only properties they manage
      const penjagaPropertyIds = Array.isArray(this.userDetail?.property_id) ? this.userDetail.property_id : [];
      let propertyDetails: any[] = [];
      if (penjagaPropertyIds.length === 0) {
        this.properties = [];
        return;
      }
      let loaded = 0;
      penjagaPropertyIds.forEach((propertyId: number) => {
        this.propertyService.getPropertyById(propertyId).subscribe((res: any) => {
          if (res && res.data) {
            propertyDetails.push(res.data);
          }
          loaded++;
          if (loaded === penjagaPropertyIds.length) {
            this.properties = propertyDetails;
          }
        });
      });
    } else {
      // Pemilik: fetch all owner properties
      this.propertyService.getOwnerProperties().subscribe((res: any) => {
        this.properties = res.data || res;
      });
    }
  }

  onPropertyChange(event: any) {
    if(event){
      var propertyId = event.value;
      this.units = [];
      this.financialForm.get('unit_id')?.setValue(null);
      this.propertyService.getPropertyById(propertyId).subscribe((res: any) => {
        if (res.data && res.data.units) {
          this.units = res.data.units;
        } else {
          this.units = [];
        }
      });
    }
  }

  onCancel(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      this.router.navigate(['/statistik']);
    }
  }

  onFinancialPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type.match('image.*')) {
      this.financialPhotoFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.financialPhotoPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async uploadFinancialPhoto(): Promise<string> {
    if (!this.financialPhotoFile) return '';
    try {
      const result = await this.cloudinaryService.uploadImage(this.financialPhotoFile).toPromise();
      return result.secure_url;
    } catch (err) {
      return '';
    }
  }

  async onSubmit(): Promise<void> {
    if (this.financialForm.valid) {
      this.isLoading = true;
      let financialPhotoUrl = '';
      if (this.financialPhotoFile) {
        financialPhotoUrl = await this.uploadFinancialPhoto();
        this.financialForm.get('financial_photo_path')?.setValue(financialPhotoUrl);
      }
      const payload = {
        property_id: this.financialForm.get('property_id')?.value,
        unit_id: this.financialForm.get('unit_id')?.value,
        income: this.financialForm.get('nominalPemasukan')?.value,
        expense: this.financialForm.get('nominalPengeluaran')?.value,
        description: this.financialForm.get('deskripsi')?.value,
        date: this.financialForm.get('tanggal')?.value,
        financial_photo_path: this.financialForm.get('financial_photo_path')?.value
      };
      if (this.mode === 'edit' && this.editId) {
        this.financialService.updateFinancialReport(this.editId, payload).subscribe({
          next: (res: any) => {
            this.isLoading = false;
            if (this.dialogRef) {
              this.dialogRef.close(true);
            } else {
              this.router.navigate(['/statistik']);
            }
          },
          error: (err: any) => {
            this.isLoading = false;
          }
        });
      } else {
        this.financialService.addFinancialReport(payload).subscribe({
          next: (res: any) => {
            this.isLoading = false;
            if (this.dialogRef) {
              this.dialogRef.close(true);
            } else {
              this.router.navigate(['/statistik']);
            }
          },
          error: (err: any) => {
            this.isLoading = false;
          }
        });
      }
    }
  }

  onFileSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    this.selectedFiles = files;
    this.previewUrls = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrls.push(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number): void {
    this.selectedFiles = this.selectedFiles.filter((_, i) => i !== index);
    this.previewUrls = this.previewUrls.filter((_, i) => i !== index);
    // Reset file input jika semua file dihapus
    if (this.selectedFiles.length === 0) {
      const fileInput = document.getElementById('financialPhoto') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  }
}
