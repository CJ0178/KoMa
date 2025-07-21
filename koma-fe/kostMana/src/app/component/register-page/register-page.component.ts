import { Component, EventEmitter, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { AlertService } from '../../service/alert.service';

@Component({
  selector: 'app-register-page',
  standalone: false,
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css']
})
export class RegisterPageComponent {
  genders = [
    { value: 'L', label: 'Laki-laki' },
    { value: 'P', label: 'Perempuan' }
  ];

  RoleOption = [
    { value: 2 , label: 'Pemilik Kost'},
    { value: 3 , label: 'Penjaga Kost'},
    { value: 4 , label: 'Penghuni Kost'},
  ]

  KostList = [
    { id: '123123', label: 'Kost Jakarta Damai'},
    { id: '456456', label: 'Kost Jakarta Barat'},
  ]

  form: FormGroup;
  ispenjaga : boolean = false;
  ispemilik : boolean = false;

  constructor(
    private fb: FormBuilder,
    private location: Location,
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService
  ) {
    this.form = this.fb.group({
      UserName: ['', [Validators.required, Validators.maxLength(40)]],
      TelNum: ['', [
        Validators.required,
        Validators.pattern(/^\+?\d{10,15}$/)
      ]],
      Email: ['', [Validators.required, Validators.email]],
      gender: ['', Validators.required],
      birthDate: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]).{8,}$/)]],
      confirmPassword: ['', [Validators.required]],
      Role: ['', [Validators.required]],
      KostJaga: ['']

    }, { validators: this.passwordMatchValidator });
  }

  get TelNum() {
    return this.form.get('TelNum');
  }

  get gender() {
    return this.form.get('gender');
  }

  get Role(){
    return this.form.get('Role');
  }

  get KostJaga(){
    return this.form.get('KostJaga');
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordsMismatch: true };
  }

  CekRole(event : any){
    if(event == 'penjaga'){
      this.ispenjaga = true;
    }else if(event == 'pemilik'){
      this.ispemilik = true;
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const payload = {
        name: this.form.value.UserName,
        email: this.form.value.Email,
        password: this.form.value.password,
        gender: this.form.value.gender,
        phone_number: this.form.value.TelNum,
        date_of_birth: this.form.value.birthDate,
        role_id: this.form.value.Role
      };
      this.authService.register(payload).subscribe({
        next: (res) => {
          this.alertService.success((res as any)?.message || 'Registrasi berhasil!');
          if (res && res.data && res.data.login_detail) {
            localStorage.setItem('access_token', res.data.login_detail.access_token);
            if (res.data.login_detail.user_detail) {
              localStorage.setItem('user_detail', JSON.stringify(res.data.login_detail.user_detail));
              this.authService.setUser(res.data.login_detail.user_detail); // update user observable
            }
          }
          if (this.form.value.Role === 2) {
            this.router.navigate(['register-property']);
          } else {
            this.router.navigate(['landing-page']);
          }
        },
        error: (err) => {
          this.alertService.error((err?.error as any)?.message || 'Gagal registrasi.');
        }
      });
    }
  }

  getRoleId(role: string): number {
    switch(role) {
      case 'pemilik': return 1;
      case 'penghuni': return 2;
      case 'penjaga': return 3;
      default: return 2;
    }
  }

  goBack() {
    this.location.back();
  }

  getSelectValue(event: Event): string {
    return (event.target && (event.target as HTMLSelectElement).value) || '';
  }
}
