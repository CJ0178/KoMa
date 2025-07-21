import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-expense-detail',
  standalone: false,

  templateUrl: './add-expense-detail.component.html',
  styleUrl: './add-expense-detail.component.css'
})
export class AddExpenseDetailComponent {
  expenseForm: FormGroup;
  selectedFile: File | null = null;

  constructor(private fb: FormBuilder) {
    this.expenseForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(30)]],
      amount: ['', [Validators.required, Validators.min(1)]],
      description: ['']
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit(): void {
    if (this.expenseForm.valid) {
      const formData = new FormData();
      formData.append('title', this.expenseForm.get('title')?.value);
      formData.append('amount', this.expenseForm.get('amount')?.value);
      formData.append('description', this.expenseForm.get('description')?.value);

      if (this.selectedFile) {
        formData.append('receipt', this.selectedFile);
      }

      // Here you would typically send the formData to your backend
      console.log('Form submitted:', formData);

      // Reset form after submission
      this.expenseForm.reset();
      this.selectedFile = null;
    }
  }

  onCancel(): void {
    this.expenseForm.reset();
    this.selectedFile = null;
  }
}
