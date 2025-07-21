import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../service/property.service';

@Component({
  selector: 'app-add-notification-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './add-notification-dialog.component.html',
  styleUrls: ['./add-notification-dialog.component.css']
})
export class AddNotificationDialogComponent implements OnInit {
  notificationForm: FormGroup;
  propertyList: any[] = [];
  unitList: any[] = [];
  isEditMode: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<AddNotificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private propertyService: PropertyService
  ) {
    this.propertyList = data.propertyList || [];
    this.notificationForm = this.fb.group({
      property_id: [null, Validators.required],
      unit_id: [null],
      notification_category: ['', Validators.required],
      content: ['', Validators.required]
    });
  }

  ngOnInit() {
    // If editing, patch form values
    if (this.data.notification) {
      this.isEditMode = this.data.isEditMode;
      const notif = this.data.notification;
      this.notificationForm.patchValue({
        property_id: notif.property_id,
        unit_id: notif.unit_id,
        notification_category: notif.notification_category || notif.title || '',
        content: notif.content
      });
      // Patch unit_id only after unitList is set
      setTimeout(() => {
        if (this.unitList && this.unitList.length > 0) {
          this.notificationForm.patchValue({ unit_id: notif.unit_id });
        }
      }, 0);
      // If unitList not provided, fetch units for the selected property
      if ((!this.unitList || this.unitList.length === 0) && notif.property_id) {
        this.propertyService.getPropertyById(notif.property_id).subscribe((response: any) => {
          this.unitList = response.data.units ? response.data.units.map((unit: any) => ({
            id: unit.id,
            unit_name: unit.unit_name || unit.name || unit.label || 'Unit'
          })) : [];
          this.notificationForm.patchValue({ unit_id: notif.unit_id });
        });
      }
    }
    this.notificationForm.get('property_id')?.valueChanges.subscribe(propertyId => {
      if (propertyId) {
        this.propertyService.getPropertyById(propertyId).subscribe((property: any) => {
          this.unitList = property.units ? property.units.map((unit: any) => ({
            id: unit.id,
            unit_name: unit.unit_name || unit.name || unit.label || 'Unit'
          })) : [];
          this.notificationForm.get('unit_id')?.setValue(null);
        });
      } else {
        this.unitList = [];
        this.notificationForm.get('unit_id')?.setValue(null);
      }
    });
  }

  onSubmit() {
    if (this.notificationForm.valid) {
      this.dialogRef.close(this.notificationForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  onPropertyChange(event: any) {
    const propertyId = event && event.target ? event.target.value : event;
    if (!propertyId) {
      this.unitList = [];
      this.notificationForm.get('unit_id')?.setValue(null);
      return;
    }
    this.propertyService.getPropertyById(propertyId).subscribe((property: any) => {
      this.unitList = property.data && property.data.units ? property.data.units.map((unit: any) => ({
        id: unit.id,
        unit_name: unit.unit_name || unit.name || unit.label || 'Unit'
      })) : [];
      this.notificationForm.get('unit_id')?.setValue(null);
    });
  }
}
