import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ComplaintService } from '../../../service/complaint.service';
import { CloudinaryService } from '../../../service/cloudinary.service';
import { Router } from '@angular/router';
import { AlertService } from '../../../service/alert.service';
import { PropertyService } from '../../../service/property.service';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-create-complaint',
  standalone: false,

  templateUrl: './create-complaint.component.html',
  styleUrl: './create-complaint.component.css'
})
export class CreateComplaintComponent {
  complaintForm: FormGroup;
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  isSubmitting = false;
  isError = false;
  errorMessage = '';
  userProperties: any[] = [];
  units: any[] = [];

  constructor(
    private fb: FormBuilder,
    private complaintService: ComplaintService,
    private cloudinaryService: CloudinaryService,
    private router: Router,
    private alertService: AlertService,
    private propertyService: PropertyService, // pastikan sudah di provider
    private authService: AuthService // pastikan sudah di provider
  ) {
    this.complaintForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(30)]],
      description: ['', [Validators.maxLength(250)]],
      property_id: [null, Validators.required],
      unit_id: [null]
    });
    this.loadUserProperties();
  }

  loadUserProperties() {
    this.authService.user$.subscribe(user => {
      const propertyIds = Array.isArray(user?.property_id) ? user.property_id : [];
      let propertyDetails: any[] = [];
      if (propertyIds.length === 0) {
        this.userProperties = [];
        return;
      }
      let loaded = 0;
      propertyIds.forEach((propertyId: number) => {
        this.propertyService.getPropertyById(propertyId).subscribe((res: any) => {
          if (res && res.data) {
            propertyDetails.push(res.data);
          }
          loaded++;
          if (loaded === propertyIds.length) {
            this.userProperties = propertyDetails;
          }
        });
      });
    });
  }

  onPropertyChange(propertyId: number) {
    this.units = [];
    const unitControl = this.complaintForm.get('unit_id');
    if (unitControl) unitControl.setValue(null);
    this.propertyService.getPropertyById(propertyId).subscribe((res: any) => {
      this.units = res.data?.units || [];
    });
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
      const fileInput = document.getElementById('photo') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  }

  onSubmit(): void {
    if (this.complaintForm.invalid) {
      return;
    }
    this.isSubmitting = true;
    this.isError = false;
    this.errorMessage = '';
    const uploadPromises = this.selectedFiles.map(file =>
      this.cloudinaryService.uploadImage(file).toPromise()
    );
    Promise.all(uploadPromises).then(results => {
      const photos = results.map((res: any, idx: number) => ({
        file_name: this.selectedFiles[idx].name,
        file_path: res.secure_url
      }));
      const payload: any = {
        title: this.complaintForm.get('title')?.value,
        description: this.complaintForm.get('description')?.value,
        property_id: this.complaintForm.get('property_id')?.value,
        photos
      };
      const unitId = this.complaintForm.get('unit_id')?.value;
      if (unitId !== null && unitId !== '') {
        payload.unit_id = unitId;
      }
      this.complaintService.createComplaint(payload).subscribe({
        next: (res: any) => {
          this.isSubmitting = false;
          this.complaintForm.reset();
          this.selectedFiles = [];
          this.previewUrls = [];
          this.alertService.success((res as any)?.message || 'Keluhan berhasil dikirim!');
          this.router.navigate(['/complain-page']);
        },
        error: (err: any) => {
          this.isSubmitting = false;
          this.isError = true;
          this.errorMessage = 'Gagal mengirim keluhan. Silakan coba lagi.';
          this.alertService.error((err?.error as any)?.message || 'Gagal mengirim keluhan.');
        }
      });
    }).catch(() => {
      this.isSubmitting = false;
      this.isError = true;
      this.errorMessage = 'Gagal upload foto. Silakan coba lagi.';
      this.alertService.error('Gagal upload foto.');
    });
  }

  goBack() {
    this.router.navigate(['/complain-page']);
  }
}
