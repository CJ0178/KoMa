import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-input-email',
  standalone: false,

  templateUrl: './input-email.component.html',
  styleUrl: './input-email.component.css'
})
export class InputEmailComponent {
  loginForm!: FormGroup;

    constructor(private fb: FormBuilder) {}

    ngOnInit(): void {
      this.loginForm = this.fb.group({
        email: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]]
      });
    }

    onSubmit(): void {
      if (this.loginForm.valid) {
        console.log('Form submitted:', this.loginForm.value);
      }
    }
}
