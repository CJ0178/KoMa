import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComplaintService } from '../../../service/complaint.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { CloudinaryService } from '../../../service/cloudinary.service';
import { PropertyService } from '../../../service/property.service';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-edit-complaint',
  templateUrl: './edit-complaint.component.html',
  styleUrls: ['./edit-complaint.component.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class EditComplaintComponent implements OnInit {
  complaintForm!: FormGroup;
  isSubmitting = false;
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  complaintId: string = '';
  userProperties: any[] = [];
  units: any[] = [];
  complaintData: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private complaintService: ComplaintService,
    private cloudinaryService: CloudinaryService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private propertyService: PropertyService,
    private authService: AuthService
  ) {
    this.loadUserProperties();
  }

  ngOnInit() {
    this.complaintId = this.route.snapshot.paramMap.get('id') || '';
    this.complaintForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', [Validators.required, Validators.maxLength(250)]],
      property_id: [null],
      unit_id: [''],
      photo: ['']
    });
    if (this.complaintId) {
      this.complaintService.getComplaintById(this.complaintId).subscribe({
        next: (res: any) => {
          const data = res.data;
          this.complaintData = data;
          this.complaintForm.patchValue({
            title: data.title,
            description: data.description,
            property_id: data.property_id || null
          });
          if (data.photos && data.photos.length) {
            this.previewUrls = data.photos.map((p: any) => p.file_path);
          }
          if (data.property_id) {
            this.propertyService.getPropertyById(data.property_id).subscribe((res: any) => {
              this.units = res.data?.units || [];
              this.complaintForm.patchValue({
                unit_id: data.unit_id || ''
              });
            });
          } else {
            this.complaintForm.patchValue({
              unit_id: data.unit_id || ''
            });
          }
        },
        error: () => {
          this.snackBar.open('Gagal memuat data keluhan', 'Tutup', { duration: 2000 });
        }
      });
    }
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

  onFileSelected(event: any) {
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

  removeImage(index: number) {
    this.selectedFiles = this.selectedFiles.filter((_, i) => i !== index);
    this.previewUrls = this.previewUrls.filter((_, i) => i !== index);
    if (this.selectedFiles.length === 0) {
      const fileInput = document.getElementById('photo') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  }

  onSubmit() {
    if (this.complaintForm.invalid || !this.complaintId) return;
    this.isSubmitting = true;
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
      this.complaintService.updateComplaint(this.complaintId, payload).subscribe({
        next: (res: any) => {
          this.snackBar.open('Keluhan berhasil diupdate!', 'Tutup', { duration: 2000 });
          this.router.navigate(['/complain-page', this.complaintId]);
        },
        error: () => {
          this.snackBar.open('Gagal update keluhan', 'Tutup', { duration: 2000 });
        }
      }).add(() => this.isSubmitting = false);
    }).catch(() => {
      this.isSubmitting = false;
      this.snackBar.open('Gagal upload foto. Silakan coba lagi.', 'Tutup', { duration: 2000 });
    });
  }

  goBack() {
    this.router.navigate(['/complain-page', this.complaintId]);
  }
}
