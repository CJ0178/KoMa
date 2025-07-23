import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { PropertyService } from '../../service/property.service';
import { HttpClient } from '@angular/common/http';
import { CloudinaryService } from '../../service/cloudinary.service';
import { UnitService } from '../../service/unit.service';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FacilityCategoryService } from '../../service/facility-category.service';
import { AlertService } from '../../service/alert.service';

@Component({
  selector: 'app-add-unit',
  standalone: false,

  templateUrl: './add-unit.component.html',
  styleUrl: './add-unit.component.css'
})
export class AddUnitComponent implements OnInit {
  unitForm: FormGroup;
  isDragging = false;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  selectedFiles: File[] = [];
  imagePreviews: (string | ArrayBuffer | null)[] = [];

  // For file-upload-container compatibility
  unitFiles: File[] = [];
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private location: Location,
    private propertyService: PropertyService,
    private http: HttpClient,
    private cloudinaryService: CloudinaryService,
    private unitService: UnitService,
    private activatedRoute: ActivatedRoute,
    private snackBar: MatSnackBar,
    private facilityCategoryService: FacilityCategoryService,
    private alertService: AlertService
  ) {
    this.unitForm = this.fb.group({
      property_id: ['', Validators.required],
      unit_name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      unit_width: ['', [Validators.required, Validators.min(0)]],
      unit_height: ['', [Validators.required, Validators.min(0)]],
      floor: ['', [Validators.required, Validators.min(1)]],
      bed_type_id: [null, [Validators.required]],
      description: ['', Validators.required],
      available: [true, Validators.required],
      keeper_id: [''],
      promo_price: [''],
      deposit_fee: [''],
      unit_capacity: ['', [Validators.required, Validators.min(1)]],
      occupant_id: [''],
      photos: [[]],
      facilities: this.fb.array([])
    });

    // Set property_id jika ada di route
    const propertyId = this.activatedRoute.snapshot.paramMap.get('propertyId');
    if (propertyId) {
      this.unitForm.patchValue({ property_id: propertyId });
    }

    this.facilitiesFormArray = this.fb.array([]);
    this.unitForm.setControl('facilities', this.facilitiesFormArray);
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

  // Handle drag & drop for multiple files
  onFilesDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files) {
      const files = event.dataTransfer.files;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.match('image.*')) {
          this.unitFiles.push(file);
          const reader = new FileReader();
          reader.onload = () => {
            this.imagePreviews.push(reader.result);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }

  // Update onFilesSelected to also update unitFiles
  onFilesSelected(event: any): void {
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.match('image.*')) {
        this.unitFiles.push(file);
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviews.push(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(index: number): void {
    // Remove image from unitFiles and imagePreviews
    this.unitFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  selectedLocation: { lat: number; lng: number} | null = null;

  onLocationSelected(location: { lat: number; lng: number }) {
    this.selectedLocation = location;
    this.unitForm.controls['Latitude'].setValue(location.lat);
    this.unitForm.controls['Longitude'].setValue(location.lng);
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

  facilityList: any[] = [];

  selectedFacilities: any[] = [];
  facilitiesFormArray: any;

  ngOnInit() {
    this.unitForm.setControl('facilities', this.facilitiesFormArray);
    this.getAllFacilityCategory();
  }

  getAllFacilityCategory(){
    this.facilityCategoryService.getAllFacilityCategory().subscribe({
      next: (res) => {
        this.facilityList = res.data;
      }
    });
  }

  onFacilityToggle(facility: any, checked: boolean) {
    if (checked) {
      this.selectedFacilities.push({
        facility_id: facility.id,
        facility_category_id: facility.id, // backend expects id for category?
        facility_category: facility.category,
        facility_name: facility.facility_name,
        quantity: 1,
        notes: ''
      });
    } else {
      this.selectedFacilities = this.selectedFacilities.filter(f => f.facility_id !== facility.id);
    }
    this.unitForm.patchValue({ facilities: this.selectedFacilities });
  }

  onFacilityCheckboxChange(facility: any, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.onFacilityToggle(facility, checked);
  }

  onFacilityChange(facilityId: number, field: 'quantity' | 'notes', value: any) {
    const fac = this.selectedFacilities.find(f => f.facility_id === facilityId);
    if (fac) {
      fac[field] = value;
      this.unitForm.patchValue({ facilities: this.selectedFacilities });
    }
  }

  onFacilityInputChange(facilityId: number, field: 'quantity' | 'notes', event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.onFacilityChange(facilityId, field, value);
  }

  isFacilitySelected(facilityId: number): boolean {
    return this.selectedFacilities.some(f => f.facility_id === facilityId);
  }

  getFacilityData(facilityId: number): any {
    return this.selectedFacilities.find(f => f.facility_id === facilityId);
  }

  async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.width, height: img.height });
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async onSubmit(): Promise<void> {
    if (this.unitForm.valid) {
      this.isLoading = true;
      try {
        // Upload semua foto jika ada
        let photoUrls: any[] = [];
        if (this.unitFiles.length > 0) {
          for (const file of this.unitFiles) {
            const uploadRes: any = await firstValueFrom(this.cloudinaryService.uploadImage(file));
            const { width, height } = await this.getImageDimensions(file);
            photoUrls.push({
              file_path: uploadRes.secure_url,
              file_name: file.name,
              width,
              height
            });
          }
        }
        // Siapkan payload unit
        const unitData = {
          ...this.unitForm.value,
          price: Number(this.unitForm.value.price),
          unit_width: Number(this.unitForm.value.unit_width),
          unit_height: Number(this.unitForm.value.unit_height),
          unit_capacity: Number(this.unitForm.value.unit_capacity),
          promo_price: this.unitForm.value.promo_price ? Number(this.unitForm.value.promo_price) : undefined,
          deposit_fee: this.unitForm.value.deposit_fee ? Number(this.unitForm.value.deposit_fee) : undefined,
          photos: photoUrls,
          facilities: this.selectedFacilities // pastikan facilities terisi
        };
        this.unitService.createUnit(unitData).subscribe({
          next: (res) => {
            this.alertService.success(res?.message || 'Unit berhasil dibuat!');
            this.isLoading = false;
            this.router.navigate(['property-detail', unitData.property_id]);
          },
          error: (err) => {
            this.isLoading = false;
            this.alertService.error(err?.error?.message || 'Gagal membuat unit.');
          }
        });
      } catch (err) {
        this.isLoading = false;
        this.alertService.error('Gagal upload gambar');
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/']);
  }

  onFacilitiesChange(facilities: any[]) {
    this.selectedFacilities = facilities;
    this.unitForm.patchValue({ facilities });
  }

  onFacilityAdd(fac: any) {
    if (!this.isFacilitySelected(fac.id)) {
      this.selectedFacilities.push({
        facility_id: fac.id,
        facility_category_id: fac.id, // sesuaikan jika ada id kategori
        facility_category: fac.category,
        facility_name: fac.facility_name,
        quantity: 1,
        notes: ''
      });
      (this.facilitiesFormArray as any).push(this.fb.group({
        facility_id: [fac.id],
        facility_category_id: [fac.id],
        facility_category: [fac.category],
        facility_name: [fac.facility_name],
        quantity: [1, [Validators.required, Validators.min(1)]],
        notes: ['']
      }));
      this.unitForm.patchValue({ facilities: this.selectedFacilities });
    }
  }

  removeFacility(index: number) {
    this.selectedFacilities.splice(index, 1);
    (this.facilitiesFormArray as any).removeAt(index);
    this.unitForm.patchValue({ facilities: this.selectedFacilities });
  }

  get facilityCategories() {
    const categories: { [key: string]: any[] } = {};
    this.unitFacilityCategories.forEach(fac => {
      if (!categories[fac.category]) categories[fac.category] = [];
      categories[fac.category].push(fac);
    });
    return categories;
  }

  get facilities(): FormArray {
    return this.unitForm.get('facilities') as FormArray;
  }

  get bedTypes() {
    return this.facilityList.filter(fac => fac.category === 'KASUR');
  }

  get unitFacilityCategories() {
    return this.facilityList.filter(fac => fac.category != 'KASUR' && !fac.category.includes('PROPERTY'));
  }
}
