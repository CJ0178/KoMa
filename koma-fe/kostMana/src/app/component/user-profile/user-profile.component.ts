import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Component as NgComponent, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CloudinaryService } from '../../service/cloudinary.service';
import { UserService } from '../../service/user.service';
import { firstValueFrom } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertService } from '../../service/alert.service';

@Component({
  selector: 'app-user-profile',
  standalone: false,

  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
  user: any = null;
  passwordForm: FormGroup;
  passwordError: string = '';
  passwordSuccess: string = '';

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private http: HttpClient,
    private dialog: MatDialog,
    private alertService: AlertService,
    private userService: UserService // tambahkan dependency
  ) {
    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
    });
  }

  getRoleName(roleId: number): string {
    switch (roleId) {
      case 2: return 'Pemilik';
      case 3: return 'Penjaga';
      case 4: return 'Penghuni';
      default: return 'Tamu';
    }
  }

  onChangePassword() {
    this.passwordError = '';
    this.passwordSuccess = '';
    if (this.passwordForm.value.newPassword !== this.passwordForm.value.confirmPassword) {
      this.passwordError = 'Konfirmasi password tidak cocok.';
      return;
    }
    const payload = {
      oldPassword: this.passwordForm.value.oldPassword,
      newPassword: this.passwordForm.value.newPassword
    };
    this.userService.updatePassword(payload).subscribe({
      next: (res) => {
        this.alertService.success((res as any)?.message || 'Password berhasil diubah!');
        this.passwordSuccess = 'Password berhasil diubah.';
        this.passwordForm.reset();
      },
      error: (err) => {
        this.alertService.error((err?.error as any)?.message || 'Gagal mengubah password.');
        this.passwordError = err?.error?.message || 'Gagal mengubah password.';
      }
    });
  }

  openChangePasswordDialog() {
    this.dialog.open(ChangePasswordDialogComponent, {
      width: '350px',
      data: {
        passwordForm: this.fb.group({
          oldPassword: ['', Validators.required],
          newPassword: ['', [Validators.required, Validators.minLength(6)]],
          confirmPassword: ['', Validators.required]
        })
      }
    });
  }

  openEditProfileDialog() {
    this.dialog.open(EditProfileDialogComponent, {
      width: '420px',
      data: { user: this.user }
    });
  }
}

@NgComponent({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="change-password-dialog">
      <h2 class="dialog-title">Ganti Password</h2>
      <form [formGroup]="passwordForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Password Lama</label>
          <input type="password" formControlName="oldPassword" required class="input-field" />
        </div>
        <div class="form-group">
          <label>Password Baru</label>
          <input type="password" formControlName="newPassword" required class="input-field" />
        </div>
        <div class="form-group">
          <label>Konfirmasi Password Baru</label>
          <input type="password" formControlName="confirmPassword" required class="input-field" />
        </div>
        <button type="submit" class="change-password-btn" [disabled]="passwordForm.invalid">Simpan Password Baru</button>
        <div *ngIf="passwordError" class="password-error">{{ passwordError }}</div>
        <div *ngIf="passwordSuccess" class="password-success">{{ passwordSuccess }}</div>
      </form>
      <button class="close-dialog-btn" (click)="close()">Tutup</button>
    </div>
  `,
  styles: [`
    .change-password-dialog {
      padding: 32px 32px 18px 32px;
      min-width: 0;
      max-width: 100vw;
      width: 100%;
      background: #f8fafc;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.10);
      margin: 0 auto;
      text-align: center;
      box-sizing: border-box;
    }
    .dialog-title {
      margin-bottom: 24px;
      color: #2d3a4a;
      font-weight: 700;
    }
    .form-group {
      margin-bottom: 18px;
      text-align: left;
    }
    .form-group label {
      display: block;
      margin-bottom: 6px;
      color: #4f5d75;
      font-size: 15px;
    }
    .input-field {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #dbeafe;
      border-radius: 6px;
      font-size: 15px;
      background: #fff;
      box-sizing: border-box;
    }
    .change-password-btn {
      background: #4f5d75;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 10px 22px;
      font-size: 16px;
      cursor: pointer;
      margin-top: 8px;
      transition: background 0.2s;
    }
    .change-password-btn:disabled {
      background: #b0b7c3;
      cursor: not-allowed;
    }
    .close-dialog-btn {
      background: #aaa;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 8px 18px;
      font-size: 15px;
      cursor: pointer;
      margin-top: 18px;
      margin-bottom: 4px;
    }
    .password-error {
      color: #e74c3c;
      margin-top: 10px;
      font-size: 14px;
    }
    .password-success {
      color: #27ae60;
      margin-top: 10px;
      font-size: 14px;
    }
    .change-password-dialog form {
      padding: 0 12px 0 12px;
    }
    @media (max-width: 600px) {
      .change-password-dialog {
        min-width: 0;
        max-width: 98vw;
        width: 98vw;
        padding: 18px 2vw;
      }
    }
  `]
})
export class ChangePasswordDialogComponent {
  passwordForm: FormGroup;
  passwordError: string = '';
  passwordSuccess: string = '';

  constructor(
    public dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    private fb: FormBuilder,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar,
    private userService: UserService // tambahkan dependency
  ) {
    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  onSubmit() {
    this.passwordError = '';
    this.passwordSuccess = '';
    if (this.passwordForm.value.newPassword !== this.passwordForm.value.confirmPassword) {
      this.passwordError = 'Konfirmasi password tidak cocok.';
      return;
    }
    const payload = {
      oldPassword: this.passwordForm.value.oldPassword,
      newPassword: this.passwordForm.value.newPassword,
      confirmPassword: this.passwordForm.value.confirmPassword
    };
    this.userService.updatePassword(payload).subscribe({
      next: (res) => {
        this.snackBar.open((res as any)?.message || 'Password berhasil diubah!', 'Tutup', { duration: 3000, verticalPosition: 'top', horizontalPosition: 'right', panelClass: 'snackbar-success' });
        this.passwordSuccess = 'Password berhasil diubah.';
        this.passwordForm.reset();
        this.dialogRef.close();
      },
      error: (err) => {
        this.snackBar.open((err?.error as any)?.message || 'Gagal mengubah password.', 'Tutup', { duration: 3000, verticalPosition: 'top', horizontalPosition: 'right', panelClass: 'snackbar-error' });
        this.passwordError = err?.error?.message || 'Gagal mengubah password.';
      }
    });
  }

  close() {
    this.dialogRef.close();
  }
}

@NgComponent({
  selector: 'app-edit-profile-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="edit-profile-dialog">
      <h2 class="dialog-title">Edit Profil</h2>
      <form [formGroup]="editForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Nama</label>
          <input type="text" formControlName="name" required class="input-field" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" formControlName="email" required class="input-field" />
        </div>
        <div class="form-group">
          <label>No. HP</label>
          <input type="text" formControlName="phone_number" required class="input-field" />
        </div>
        <div class="form-group">
          <label>Tanggal Lahir</label>
          <input type="date" formControlName="date_of_birth" required class="input-field" />
        </div>
        <div class="form-group">
          <label>Foto Profil</label>
          <input type="file" (change)="onFileSelected($event)" accept="image/*" />
          <img *ngIf="imagePreview" [src]="imagePreview" class="profile-avatar" style="margin-top:10px;" />
        </div>
        <button type="submit" class="change-password-btn" [disabled]="editForm.invalid">Simpan Perubahan</button>
        <div *ngIf="editError" class="password-error">{{ editError }}</div>
        <div *ngIf="editSuccess" class="password-success">{{ editSuccess }}</div>
      </form>
      <button class="close-dialog-btn" (click)="close()">Tutup</button>
    </div>
  `,
  styles: [`
    .edit-profile-dialog {
      padding: 32px 32px 18px 32px;
      min-width: 0;
      max-width: 100vw;
      width: 100%;
      background: #f8fafc;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.10);
      margin: 0 auto;
      text-align: center;
      box-sizing: border-box;
    }
    .dialog-title {
      margin-bottom: 24px;
      color: #2d3a4a;
      font-weight: 700;
    }
    .form-group {
      margin-bottom: 18px;
      text-align: left;
    }
    .form-group label {
      display: block;
      margin-bottom: 6px;
      color: #4f5d75;
      font-size: 15px;
    }
    .input-field {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #dbeafe;
      border-radius: 6px;
      font-size: 15px;
      background: #fff;
      box-sizing: border-box;
    }
    .change-password-btn {
      background: #4f5d75;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 10px 22px;
      font-size: 16px;
      cursor: pointer;
      margin-top: 8px;
      transition: background 0.2s;
    }
    .change-password-btn:disabled {
      background: #b0b7c3;
      cursor: not-allowed;
    }
    .close-dialog-btn {
      background: #aaa;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 8px 18px;
      font-size: 15px;
      cursor: pointer;
      margin-top: 18px;
      margin-bottom: 4px;
    }
    .password-error {
      color: #e74c3c;
      margin-top: 10px;
      font-size: 14px;
    }
    .password-success {
      color: #27ae60;
      margin-top: 10px;
      font-size: 14px;
    }
    .profile-avatar {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #e0e7ef;
      background: #fff;
      margin: 0 auto;
      display: block;
    }
    @media (max-width: 600px) {
      .edit-profile-dialog {
        min-width: 0;
        max-width: 98vw;
        width: 98vw;
        padding: 18px 2vw;
      }
    }
  `]
})
export class EditProfileDialogComponent {
  editForm: FormGroup;
  editError: string = '';
  editSuccess: string = '';
  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  constructor(
    public dialogRef: MatDialogRef<EditProfileDialogComponent>,
    private fb: FormBuilder,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cloudinaryService: CloudinaryService,
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.editForm = this.fb.group({
      name: [data.user?.name || '', Validators.required],
      email: [data.user?.email || '', [Validators.required, Validators.email]],
      phone_number: [data.user?.phone_number || '', Validators.required],
      date_of_birth: [data.user?.date_of_birth || '', Validators.required],
      profile_picture: [data.user?.profile_picture || '']
    });
    this.imagePreview = data.user?.profile_picture || null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type.match('image.*')) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async onSubmit() {
    this.editError = '';
    this.editSuccess = '';
    let profile_picture_url = this.data.user?.profile_picture || '';
    if (this.selectedFile) {
      try {
        const result = await firstValueFrom(this.cloudinaryService.uploadImage(this.selectedFile));
        profile_picture_url = result.secure_url;
        this.imagePreview = profile_picture_url;
      } catch (err) {
        this.editError = 'Gagal upload gambar ke Cloudinary.';
        return;
      }
    }
    const payload = {
      user_id: this.data.user?.user_id,
      name: this.editForm.value.name,
      email: this.editForm.value.email,
      phone_number: this.editForm.value.phone_number,
      gender: this.editForm.value.gender || '',
      job: this.editForm.value.job || '',
      date_of_birth: this.editForm.value.date_of_birth,
      profile_picture: profile_picture_url,
      role_id: this.data.user?.role_id
    };
    this.userService.updateUser(this.data.user?.user_id, payload).subscribe({
      next: (res) => {
        this.snackBar.open((res as any)?.message || 'Profil berhasil diupdate!', 'Tutup', { duration: 3000, verticalPosition: 'top', horizontalPosition: 'right', panelClass: 'snackbar-success' });
        this.editSuccess = 'Profil berhasil diupdate.';
        // Update user menggunakan AuthService
        if (this.authService && typeof this.authService.setUser === 'function') {
          this.authService.setUser({ ...this.data.user, ...payload });
        }
        setTimeout(() => this.dialogRef.close(true), 1200);
      },
      error: (err) => {
        this.snackBar.open((err?.error as any)?.message || 'Gagal update profil.', 'Tutup', { duration: 3000, verticalPosition: 'top', horizontalPosition: 'right', panelClass: 'snackbar-error' });
        this.editError = err?.error?.message || 'Gagal update profil.';
      }
    });
  }

  close() {
    this.dialogRef.close();
  }
}
