import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';

import { AuthService } from '../../service/auth.service';
import { AlertService } from '../../service/alert.service';

@Component({
  selector: 'app-login-page',
  standalone: false,

  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent implements OnInit {

  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private http: HttpClient,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const payload = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };
      this.authService.login(payload).subscribe({
        next: (res) => {
          this.alertService.success((res as any)?.message || 'Login berhasil!');
          if (res && res.data && res.data.access_token) {
            localStorage.setItem('access_token', res.data.access_token);
            if (res.data.user_detail) {
              this.authService.setUser(res.data.user_detail);
            }
            this.router.navigate(['landing-page']);
          } else {
            this.alertService.error('Login failed: Invalid response');
          }
        },
        error: (err) => {
          this.alertService.error(err?.error?.message || 'Gagal login.');
        }
      });
    }
  }

  openForgotPasswordDialog() {
    const dialogRef = this.dialog.open(ForgotPasswordDialogComponent, {
      width: '400px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.email) {
        this.authService.forgotPassword(result.email).subscribe({
          next: (res) => {
            this.alertService.success((res as any)?.message || 'Permintaan reset password berhasil!');
          },
          error: (err) => {
            this.alertService.error(err?.error?.message || 'Gagal reset password.');
          }
        });
      }
    });
  }

}

@Component({
  selector: 'forgot-password-dialog',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="forgot-dialog-container">
      <h2 class="forgot-dialog-title">Reset Password</h2>
      <form #form="ngForm" (ngSubmit)="submit()">
        <label for="email" class="forgot-dialog-label">Email</label>
        <input id="email" name="email" [(ngModel)]="email" required type="email" class="forgot-dialog-input" />
        <div class="forgot-dialog-actions">
          <button type="button" class="forgot-dialog-cancel" (click)="close()">Batal</button>
          <button type="submit" class="forgot-dialog-submit" [disabled]="!email">Kirim</button>
        </div>
      </form>
    </div>
    <style>
      .forgot-dialog-container {
        padding: 24px;
        border-radius: 12px;
        background: var(--color-bg);
        min-width: 320px;
        max-width: 400px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      }
      .forgot-dialog-title {
        margin-top: 0;
        margin-bottom: 18px;
        font-size: 1.3rem;
        font-weight: 600;
        text-align: left;
        color: var(--color-dark);
      }
      .forgot-dialog-label {
        display: block;
        margin-bottom: 8px;
        font-size: 1rem;
        font-weight: 500;
        color: var(--color-dark);
      }
      .forgot-dialog-input {
        width: 100%;
        padding: 8px 10px;
        font-size: 1rem;
        border-radius: 8px;
        border: 1px solid var(--color-accent);
        margin-bottom: 18px;
        box-sizing: border-box;
        background: var(--color-bg);
        color: var(--color-dark);
      }
      .forgot-dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }
      .forgot-dialog-cancel {
        background: var(--color-muted);
        color: var(--color-dark);
        border: none;
        border-radius: 8px;
        padding: 6px 18px;
        font-size: 1rem;
        cursor: pointer;
      }
      .forgot-dialog-submit {
        background: var(--color-primary);
        color: var(--color-accent);
        border: none;
        border-radius: 8px;
        padding: 6px 18px;
        font-size: 1rem;
        cursor: pointer;
      }
      .forgot-dialog-submit:disabled {
        background: var(--color-muted);
        cursor: not-allowed;
      }
    </style>
  `
})
export class ForgotPasswordDialogComponent {
  email: string = '';
  constructor(@Inject(MatDialogRef) public dialogRef: MatDialogRef<ForgotPasswordDialogComponent>) {}
  close() { this.dialogRef.close(); }
  submit() { this.dialogRef.close({ email: this.email }); }
}
