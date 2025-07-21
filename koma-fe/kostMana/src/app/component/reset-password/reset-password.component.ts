import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../service/alert.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  token: string = '';
  errorMsg: string = '';
  successMsg: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit(): void {
    this.errorMsg = '';
    this.successMsg = '';
    if (this.resetForm.value.password !== this.resetForm.value.confirmPassword) {
      this.errorMsg = 'Password dan konfirmasi password tidak sama.';
      return;
    }
    if (!this.token) {
      this.errorMsg = 'Token tidak ditemukan.';
      return;
    }
    this.authService.resetPassword(this.token, this.resetForm.value.password, this.resetForm.value.confirmPassword).subscribe({
      next: (res) => {
        this.alertService.success((res as any)?.message || 'Password berhasil direset!');
        this.successMsg = 'Password berhasil direset. Silakan login dengan password baru.';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.alertService.error((err?.error as any)?.message || 'Gagal reset password.');
      }
    });
  }
}
