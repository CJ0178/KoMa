import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { PropertyService } from '../../service/property.service';
import { HttpClient } from '@angular/common/http';
import { CloudinaryService } from '../../service/cloudinary.service';
import { firstValueFrom } from 'rxjs';
import { AlertService } from '../../service/alert.service';
import { FACILITY_LIST } from './facility-list';

@Component({
  selector: 'app-register-property',
  standalone: false,

  templateUrl: './register-property.component.html',
  styleUrl: './register-property.component.css'
})
export class RegisterPropertyComponent implements OnInit {
  propertyForm: FormGroup;
  isDragging = false;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  thumbnailFile: File | null = null;
  thumbnailPreview: string | ArrayBuffer | null = null;

  propertyFiles: File[] = [];
  propertyPreviews: string[] = [];

  facilityCategories: string[] = [];
  groupedFacilities: { [key: string]: any[] } = {};

  facilities: FormArray;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private location: Location,
    private propertyService: PropertyService,
    private http: HttpClient,
    private cloudinaryService: CloudinaryService,
    private alertService: AlertService
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
    this.groupFacilities();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.handleFile(file);
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(): void {
    this.isDragging = false;
  }

  private handleFile(file: File): void {
    if (file.type.match('image.*')) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.selectedFile = null;
      this.imagePreview = null;
    }
  }

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

  selectedLocation: { lat: number; lng: number} | null = null;

  onLocationSelected(location: { lat: number; lng: number }) {
    this.selectedLocation = location;
    this.propertyForm.controls['Latitude'].setValue(location.lat);
    this.propertyForm.controls['Longitude'].setValue(location.lng);
  }

  goBack() {
    this.location.back();
  }

  // Add property type options for dropdown
  propertyTypes = [
    { value: 'Kost Campur', label: 'Kost Campur' },
    { value: 'Kost Khusus Pria', label: 'Kost Khusus Pria' },
    { value: 'Kost Khusus Wanita', label: 'Kost Khusus Wanita' }
  ];

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
    if (this.facilities.value.some((f: any) => f.facility_id === fac.id)) return;
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

  isFacilitySelected(facilityId: number): boolean {
    return this.facilities.value.some((f: any) => f.facility_id === facilityId);
  }

  async onSubmit(): Promise<void> {
    if (this.propertyForm.valid && this.thumbnailFile) {
      try {
        // 1. Upload thumbnail image to Cloudinary via service
        const uploadRes: any = await firstValueFrom(this.cloudinaryService.uploadImage(this.thumbnailFile));
        const thumbnailUrl = uploadRes.secure_url;

        // 2. Upload property images if any
        let propertyPhotoUrls: string[] = [];
        if (this.propertyFiles.length > 0) {
          for (const file of this.propertyFiles) {
            const res: any = await firstValueFrom(this.cloudinaryService.uploadImage(file));
            propertyPhotoUrls.push(res.secure_url);
          }
        }

        // 3. Get city name from latitude and longitude using Nominatim reverse geocoding
        const lat = this.propertyForm.value.Latitude;
        const lng = this.propertyForm.value.Longitude;
        let city = '';
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await response.json();
          city = data.address?.city || 'Lainnya';
        } catch (geoErr) {
          city = '';
        }

        // 4. Send property data to backend with Cloudinary image URLs as JSON
        const propertyData = {
          property_name: this.propertyForm.value.propertyName,
          address: this.propertyForm.value.propertyAddress,
          city: city,
          latitude: lat,
          longitude: lng,
          property_type: this.propertyForm.value.JenisProperti,
          thumbnail_photo_path: thumbnailUrl,
          description: this.propertyForm.value.Deskripsi
        };

        this.propertyService.createProperty(propertyData).subscribe({
          next: async (res) => {
            const propertyId = res?.data?.id;
            let allSuccess = true;
            let errorMsg = '';
            // Add facilities
            if (propertyId && this.facilities.length > 0) {
              try {
                await firstValueFrom(this.propertyService.addFacilitiesToProperty(propertyId, this.facilities.value));
              } catch (err) {
                allSuccess = false;
                errorMsg += 'Gagal menambah fasilitas. ';
              }
            }
            // Add photos
            if (propertyId && propertyPhotoUrls.length > 0) {
              const photoPayload = propertyPhotoUrls.map(url => ({ file_path: url }));
              try {
                await firstValueFrom(this.propertyService.addPhotosToProperty(propertyId, photoPayload));
              } catch (err) {
                allSuccess = false;
                errorMsg += 'Gagal menambah foto properti. ';
              }
            }
            if (allSuccess) {
              this.alertService.success((res as any)?.message || 'Properti berhasil dibuat!');
              this.router.navigate(['landing-page']);
            } else {
              this.alertService.error(errorMsg || 'Properti dibuat, tapi ada data yang gagal ditambahkan.');
            }
          },
          error: (err) => {
            this.alertService.error((err?.error as any)?.message || 'Gagal membuat properti.');
          }
        });
      } catch (err) {
        alert('Image upload failed');
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/']);
  }

  getQuantityControl(fac: any): import('@angular/forms').FormControl {
    return fac.get('quantity') as import('@angular/forms').FormControl;
  }
  getNotesControl(fac: any): import('@angular/forms').FormControl {
    return fac.get('notes') as import('@angular/forms').FormControl;
  }

  removeThumbnail(): void {
    this.thumbnailFile = null;
    this.thumbnailPreview = null;
  }

  removePropertyImage(index: number): void {
    this.propertyFiles.splice(index, 1);
    this.propertyPreviews.splice(index, 1);
  }
}
