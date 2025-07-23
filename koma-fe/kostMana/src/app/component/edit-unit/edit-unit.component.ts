import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UnitService } from '../../service/unit.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PropertyService } from '../../service/property.service';
import { CloudinaryService } from '../../service/cloudinary.service';
import { AlertService } from '../../service/alert.service';
import { FacilityCategoryService } from '../../service/facility-category.service';
import { LoadingOverlayComponent } from '../loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-edit-unit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingOverlayComponent],
  templateUrl: './edit-unit.component.html',
  styleUrls: ['./edit-unit.component.css']
})
export class EditUnitComponent implements OnInit {
  unitForm: FormGroup;
  unitId: string = '';
  imagePreviews: any[] = [];
  facilities: FormArray;
  unitFiles: File[] = [];
  isDragging: boolean = false;

  facilityList: any[] = [];
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private unitService: UnitService,
    private http: HttpClient,
    private router: Router,
    private propertyService: PropertyService,
    private cloudinaryService: CloudinaryService,
    private alertService: AlertService,
    private facilityCategoryService: FacilityCategoryService
  ) {
    this.unitForm = this.fb.group({
      unit_name: [''],
      price: [''],
      unit_width: [''],
      unit_height: [''],
      floor: [''],
      bed_type_id: [null],
      unit_capacity: [''],
      promo_price: [''],
      deposit_fee: [''],
      description: [''],
      available: [true],
      facilities: this.fb.array([])
    });
    this.facilities = this.unitForm.get('facilities') as FormArray;
  }

  ngOnInit() {
    this.unitId = this.route.snapshot.paramMap.get('id') || '';
    this.isLoading = true;
    this.unitService.getUnitById(Number(this.unitId)).subscribe((response: any) => {
      if (response && response.success && response.data) {
        this.isLoading = false;
        const unit = response.data;
        this.unitForm.patchValue({
          unit_name: unit.unit_name,
          price: unit.price,
          unit_width: unit.unit_width,
          unit_height: unit.unit_height,
          floor: unit.floor,
          bed_type_id: unit.bed_type_id,
          unit_capacity: unit.unit_capacity,
          promo_price: unit.promo_price,
          deposit_fee: unit.deposit_fee,
          description: unit.description,
          available: unit.available
        });
        if (unit.facilities) {
          unit.facilities.forEach((fac: any) => {
            this.facilities.push(this.fb.group({
              facility_id: [fac.facility_id],
              facility_category_id: [fac.facility_category_id || fac.facility_category_id],
              facility_category: [fac.facility_category || fac.category],
              facility_name: [fac.facility_name],
              quantity: [fac.quantity],
              notes: [fac.notes]
            }));
          });
        }
        if (unit.photos) {
          this.imagePreviews = unit.photos.map((p: any) => ({
            unit_photo_id: p.unit_photo_id,
            file_path: p.file_path
          }));
        }
      }
      this.getAllFacilityCategory();
    });
  }

  getAllFacilityCategory(){
    this.facilityCategoryService.getAllFacilityCategory().subscribe({
      next: (res) => {
        this.facilityList = res.data;
      }
    });
  }

  get facilityCategories() {
    const categories: { [key: string]: any[] } = {};
    this.unitFacilityCategories.forEach(fac => {
      if (!categories[fac.category]) categories[fac.category] = [];
      categories[fac.category].push(fac);
    });
    return categories;
  }

  isFacilitySelected(id: number) {
    return this.facilities.controls.some((ctrl: any) => ctrl.value.facility_category_id === id);
  }

  onFacilityAdd(fac: any) {
    if (!this.isFacilitySelected(fac.id)) {
      this.facilities.push(this.fb.group({
        facility_id: [null],
        facility_category_id: [fac.id],
        facility_category: [fac.category],
        facility_name: [fac.facility_name],
        quantity: [1],
        notes: ['']
      }));
    }
  }

  removeFacility(i: number) {
    this.facilities.removeAt(i);
  }

  onSubmit() {
    if (this.unitForm.invalid) return;
    const facilitiesPayload = this.facilities.value;
    const oldPhotos = this.imagePreviews;
    const uploadPromises = [];
    const photoObjs: Array<{ unit_photo_id: any, file_path: string }> = [];

    for (let i = 0; i < oldPhotos.length; i++) {
      const photo = oldPhotos[i];
      if (!photo.unit_photo_id) {
        if (photo.file_path.startsWith('data:')) {
          uploadPromises.push(
            this.cloudinaryService.uploadImage(photo.file_path).toPromise().then((res: any) => ({ file_path: res.secure_url }))
          );
        }
      } else {
        photoObjs.push(photo);
      }
    }

    if (uploadPromises.length > 0) {
      Promise.all(uploadPromises).then((results) => {
        const photoUrls = [...photoObjs, ...results];
        const payload = {
          ...this.unitForm.value,
          facilities: facilitiesPayload,
          photos: photoUrls
        };
        this.unitService.updateUnit(this.unitId, payload).subscribe({
          next: (res: any) => {
            this.alertService.success('Unit berhasil diupdate!');
            this.router.navigate(['/room-detail', this.unitId]);
          },
          error: (err) => {
            this.alertService.error('Gagal update unit');
          }
        });
      });
    } else {
      // Tidak ada file baru, kirim file lama saja
      const payload = {
        ...this.unitForm.value,
        facilities: facilitiesPayload,
        photos: photoObjs
      };
      this.unitService.updateUnit(this.unitId, payload).subscribe({
        next: (res: any) => {
          this.alertService.success('Unit berhasil diupdate!');
          this.router.navigate(['/room-detail', this.unitId]);
        },
        error: (err) => {
          this.alertService.error('Gagal update unit');
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/room-detail', this.unitId]);
  }

  onFilesDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.unitFiles = Array.from(event.dataTransfer.files);
      for (let i = 0; i < this.unitFiles.length; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push({ unit_photo_id: null, file_path: e.target.result });
        };
        reader.readAsDataURL(this.unitFiles[i]);
      }
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave() {
    this.isDragging = false;
  }

  onFilesSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.unitFiles = Array.from(files);
      for (let i = 0; i < this.unitFiles.length; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push({ unit_photo_id: null, file_path: e.target.result });
        };
        reader.readAsDataURL(this.unitFiles[i]);
      }
    }
  }

  removeImage(index: number) {
    this.imagePreviews.splice(index, 1);
    this.unitFiles.splice(index, 1);
  }

  get bedTypes() {
    return this.facilityList.filter(fac => fac.category === 'KASUR');
  }

  get unitFacilityCategories() {
    return this.facilityList.filter(fac => fac.category != 'KASUR' && !fac.category.includes('PROPERTY'));
  }
}
