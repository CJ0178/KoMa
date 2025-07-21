import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { PropertyService } from '../../service/property.service';
import { CloudinaryService } from '../../service/cloudinary.service';
import { firstValueFrom } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FACILITY_LIST } from '../register-property/facility-list';

@Component({
  selector: 'app-edit-property',
  standalone: false,
  templateUrl: './edit-property.component.html',
  styleUrl: './edit-property.component.css'
})
export class EditPropertyComponent implements OnInit {
  propertyForm: FormGroup;
  isDragging = false;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  propertyId: any = null;

  // Add missing properties for thumbnail and property photos
  thumbnailFile: File | null = null;
  thumbnailPreview: string | ArrayBuffer | null = null;
  propertyFiles: File[] = [];
  propertyPreviews: string[] = [];

  // Facility selection
  facilityCategories: string[] = [];
  groupedFacilities: { [key: string]: any[] } = {};
  facilities: FormArray;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private location: Location,
    private propertyService: PropertyService,
    private cloudinaryService: CloudinaryService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.propertyForm = this.fb.group({
      propertyName: ['', Validators.required],
      Latitude: ['', Validators.required],
      Longitude: ['', Validators.required],
      propertyAddress: ['', Validators.required],
      Deskripsi: ['', Validators.required],
      JenisProperti: ['', Validators.required]
    });
    this.facilities = new FormArray<any>([]);
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.propertyId = id;
        this.propertyService.getPropertyById(+id).subscribe((res: any) => {
          const p = res.data || res;
          this.propertyForm.patchValue({
            propertyName: p.property_name || p.namaProperti || '',
            Latitude: p.latitude || '',
            Longitude: p.longitude || '',
            propertyAddress: p.address || p.alamat || '',
            Deskripsi: p.description || '',
            JenisProperti: p.property_type || p.jenisKos || ''
          });
          this.thumbnailPreview = p.thumbnail_photo_path || '';

          // Auto mapping property photos
          if (Array.isArray(p.photos)) {
            this.propertyPreviews = p.photos.map((photo: any) => photo.file_path || photo.url || photo);
          } else {
            this.propertyPreviews = [];
          }

          // Auto mapping facilities
          if (Array.isArray(p.facilities)) {
            this.facilities.clear();
            p.facilities.forEach((fac: any) => {
              this.facilities.push(this.fb.group({
                facility_id: [fac.facility_id || fac.id],
                facility_category_id: [fac.facility_category_id || fac.category_id],
                facility_category: [fac.facility_category || fac.category],
                facility_name: [fac.facility_name || fac.name],
                quantity: [fac.quantity || 1, [Validators.required, Validators.min(1)]],
                notes: [fac.notes || '']
              }));
            });
          }
        });
      }
    });
    this.groupFacilities();
  }

  // Thumbnail logic
  onThumbnailFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.match('image.*')) {
      this.thumbnailFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.thumbnailPreview = reader.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.thumbnailFile = null;
      this.thumbnailPreview = null;
    }
  }

  onThumbnailFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const file = event.dataTransfer?.files[0];
    if (file && file.type.match('image.*')) {
      this.thumbnailFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.thumbnailPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Property photo logic
  onPropertyFilesSelected(event: any): void {
    this.propertyFiles = Array.from(event.target.files);
    this.propertyPreviews = [];
    this.propertyFiles.forEach(file => {
      if (file.type.match('image.*')) {
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result) this.propertyPreviews.push(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  onPropertyFilesDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files) {
      this.propertyFiles = Array.from(event.dataTransfer.files);
      this.propertyPreviews = [];
      this.propertyFiles.forEach(file => {
        if (file.type.match('image.*')) {
          const reader = new FileReader();
          reader.onload = () => {
            if (reader.result) this.propertyPreviews.push(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  removeThumbnail(): void {
    this.thumbnailFile = null;
    this.thumbnailPreview = null;
  }

  removePropertyImage(index: number): void {
    this.propertyFiles.splice(index, 1);
    this.propertyPreviews.splice(index, 1);
  }

  // Facility logic
  groupFacilities() {
    this.groupedFacilities = {};
    this.facilityCategories = [];
    FACILITY_LIST.forEach(fac => {
      if(fac.category.includes('PROPERTY_')){
        fac.category = fac.category.replace('PROPERTY_', '');
        if (!this.groupedFacilities[fac.category]) {
          this.groupedFacilities[fac.category] = [];
          this.facilityCategories.push(fac.category);
        }
        this.groupedFacilities[fac.category].push(fac);
      }
    });
  }

  addFacilityFromList(fac: any) {
    if (this.facilities.value.some((f: any) => f.facility_category_id === fac.id)) return;
    this.facilities.push(this.fb.group({
      facility_id: [fac.id],
      facility_category_id: [fac.id],
      facility_category: [fac.category],
      facility_name: [fac.facility_name],
      quantity: [1, [Validators.required, Validators.min(1)]],
      notes: ['']
    }));
  }

  removeFacility(index: number) {
    this.facilities.removeAt(index);
  }

  isFacilitySelected(facility: any): boolean {
    if(facility.id === 2){
      console.log('Checking facility:', facility);
      console.log('Current facilities:', this.facilities.value);
    }
    var check = this.facilities.value.find((f: any) => f.facility_category_id === facility.id);
    return check;
  }

  getQuantityControl(fac: any): import('@angular/forms').FormControl {
    return fac.get('quantity') as import('@angular/forms').FormControl;
  }
  getNotesControl(fac: any): import('@angular/forms').FormControl {
    return fac.get('notes') as import('@angular/forms').FormControl;
  }

  async onSubmit(): Promise<void> {
    if (this.propertyForm.valid && this.propertyId) {
      try {
        let imageUrl = this.imagePreview;
        if (this.selectedFile) {
          const uploadRes: any = await firstValueFrom(this.cloudinaryService.uploadImage(this.selectedFile));
          imageUrl = uploadRes.secure_url;
        }
        // Upload property images if any
        let propertyPhotoUrls: string[] = [];
        if (this.propertyFiles.length > 0) {
          for (const file of this.propertyFiles) {
            const res: any = await firstValueFrom(this.cloudinaryService.uploadImage(file));
            propertyPhotoUrls.push(res.secure_url);
          }
        }
        const lat = this.propertyForm.value.Latitude;
        const lng = this.propertyForm.value.Longitude;
        let city = '';
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await response.json();
          city = data.address?.city || data.address?.town || data.address?.village || '';
        } catch (geoErr) {
          city = '';
        }
        const propertyData = {
          property_name: this.propertyForm.value.propertyName,
          address: this.propertyForm.value.propertyAddress,
          latitude: lat,
          longitude: lng,
          thumbnail_photo_path: imageUrl,
          city: city,
          description: this.propertyForm.value.Deskripsi,
          property_type: this.propertyForm.value.JenisProperti
        };
        this.propertyService.updateProperty(this.propertyId, propertyData).subscribe({
          next: async (res) => {
            let allSuccess = true;
            let errorMsg = '';
            // Update facilities
            if (this.facilities.length > 0) {
              try {
                await firstValueFrom(this.propertyService.addFacilitiesToProperty(this.propertyId, this.facilities.value));
              } catch (err) {
                allSuccess = false;
                errorMsg += 'Gagal update fasilitas. ';
              }
            }
            // Update photos
            if (propertyPhotoUrls.length > 0) {
              const photoPayload = propertyPhotoUrls.map(url => ({ file_path: url }));
              try {
                await firstValueFrom(this.propertyService.addPhotosToProperty(this.propertyId, photoPayload));
              } catch (err) {
                allSuccess = false;
                errorMsg += 'Gagal update foto properti. ';
              }
            }
            if (allSuccess) {
              this.snackBar.open(res?.message || 'Properti berhasil diupdate!', 'Tutup', { duration: 3000 });
              this.router.navigate(['/property-list']);
            } else {
              this.snackBar.open(errorMsg || 'Properti diupdate, tapi ada data yang gagal ditambahkan.', 'Tutup', { duration: 4000 });
            }
          },
          error: (err) => {
            this.snackBar.open(err?.error?.message || 'Gagal update properti.', 'Tutup', { duration: 3000 });
          }
        });
      } catch (err) {
        alert('Image upload failed');
      }
    }
  }

  async onDeleteProperty() {
    if (!this.propertyId) return;
    if (!confirm('Yakin ingin menghapus properti ini?')) return;
    try {
      await firstValueFrom(this.propertyService.deleteProperty(this.propertyId));
      this.snackBar.open('Properti berhasil dihapus!', 'Tutup', { duration: 3000 });
      this.router.navigate(['/property-list']);
    } catch (err) {
      this.snackBar.open('Gagal menghapus properti.', 'Tutup', { duration: 3000 });
    }
  }

  goBack() {
    this.location.back();
  }

  propertyTypes = [
    { value: 'Kost Campur', label: 'Kost Campur' },
    { value: 'Kost Khusus Pria', label: 'Kost Khusus Pria' },
    { value: 'Kost Khusus Wanita', label: 'Kost Khusus Wanita' }
  ];

  onLocationSelected(location: { lat: number; lng: number }) {
    this.propertyForm.controls['Latitude'].setValue(location.lat);
    this.propertyForm.controls['Longitude'].setValue(location.lng);
  }

  onCancel(): void {
    this.router.navigate(['/']);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(): void {
    this.isDragging = false;
  }
}
