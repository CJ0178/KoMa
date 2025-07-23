import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FacilityCategoryService } from '../../../service/facility-category.service';

@Component({
  selector: 'app-add-facility-dialog',
  templateUrl: './add-facility-dialog.component.html',
  styleUrls: ['./add-facility-dialog.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule]
})
export class AddFacilityDialogComponent implements OnInit {
  facilityForm: FormGroup;
  facilityList: any[] = [];
  groupedFacilities: { [key: string]: any[] } = {};
  existingFacilities: any[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddFacilityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private facilityCategoryService: FacilityCategoryService
  ) {
    this.facilityForm = this.fb.group({
      facilities: this.fb.array([])
    });
    this.existingFacilities = data?.existingFacilities || [];
  }

  groupFacilities() {
    this.groupedFacilities = {};
    this.facilityList.forEach(fac => {
      if(fac.category==='PROPERTY'){
        if (!this.groupedFacilities[fac.category]) this.groupedFacilities[fac.category] = [];
        this.groupedFacilities[fac.category].push(fac);
      }
    });
  }

  get facilities() {
    return this.facilityForm.get('facilities') as FormArray;
  }

  addFacilityFromList(fac: any) {
    // Cegah duplikasi
    if (this.facilities.value.some((f: any) => f.facility_id === fac.id)) return;
    this.facilities.push(this.fb.group({
      facility_id: [fac.id],
      facility_category_id: [fac.id], // jika ada id kategori, bisa diganti
      facility_category: [fac.category],
      facility_name: [fac.facility_name],
      quantity: [1, [Validators.required, Validators.min(1)]],
      notes: ['']
    }));
  }

  removeFacility(index: number) {
    this.facilities.removeAt(index);
  }

  onSubmit() {
    if (this.facilityForm.valid) {
      this.dialogRef.close(this.facilityForm.value.facilities);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.getAllFacilityCategory();
  }

  isFacilitySelected(facilityId: number): boolean {
    console.log('Checking facility selection:', facilityId, this.facilities.value, this.existingFacilities);
    return this.facilities.value.some((f: any) => f.facility_category_id === facilityId) ||
      this.existingFacilities.some((f: any) => f.facility_category_id === facilityId);
  }

  getAllFacilityCategory(){
    this.facilityCategoryService.getAllFacilityCategory().subscribe({
      next: (res) => {
        this.facilityList = res.data;
        this.groupFacilities();
      }
    });
  }
}
