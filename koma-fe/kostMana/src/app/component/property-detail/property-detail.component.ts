import { Component, OnInit } from '@angular/core';
import { Form, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { GalleryModule, GalleryItem, ImageItem } from 'ng-gallery';
import { MatDialog } from '@angular/material/dialog';
import { PropertyService } from '../../service/property.service';
import { AuthService } from '../../service/auth.service';
import { AddFacilityDialogComponent } from '../pop-up/add-facility-dialog/add-facility-dialog.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CloudinaryService } from '../../service/cloudinary.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertService } from '../../service/alert.service';
import { UnitService } from '../../service/unit.service';
import { DeletePropertyDialogComponent } from '../property-list/delete-property-dialog.component';
import { RatingDialogComponent } from '../property-list/rating-dialog.component';
import { UserService } from '../../service/user.service';

export interface roomDetailData {
  id: any;
  roomName: string;
  price: number;
  propimage: string;
  status: number;
}

interface Image {
  src: any
}

@Component({
  selector: 'app-property-detail',
  standalone: false,

  templateUrl: './property-detail.component.html',
  styleUrl: './property-detail.component.css',
})
export class PropertyDetailComponent implements OnInit {
  selectedTab: string = 'kamar';
  PropertyId: any;
  propertyDetail: any = null;
  userRole: string = '';
  userDetail: any;

  images: string[] = [];

  units: roomDetailData[] = [];

  // Tambahkan variabel untuk viewer foto
  currentIndex = 0;
  selectedImage: string | null = null;

  allowEdit: boolean = false;
  isLoading: boolean = false;
  isPenjaga: boolean = false;
  isPenghuni: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private location: Location,
    private propertyService: PropertyService,
    private authService: AuthService,
    private dialog: MatDialog,
    private http: HttpClient,
    private cloudinaryService: CloudinaryService,
    private snackBar: MatSnackBar,
    private alertService: AlertService,
    private unitService: UnitService,
    private userService: UserService
  ) {
    this.PropertyId = this.activatedRoute.snapshot.paramMap.get('id');
    this.authService.user$.subscribe(user => {
      this.userRole = user && user.role_id === 2 ? 'pemilik' : (user && user.role_id === 3 ? 'penjaga' : (user && user.role_id === 4 ? 'penghuni' : ''));
      this.userDetail = user;
      this.isPenjaga = user && user.role_id === 3;
      this.isPenghuni = user && user.role_id === 4;
    });
  }

  changeTab(tab: string) {
    this.selectedTab = tab;
  }

  // Fetch latest property detail
  getPropertyDetail() {
    if (this.PropertyId) {
      this.isLoading = true;
      this.propertyService.getPropertyById(this.PropertyId).subscribe((response: any) => {
        this.isLoading = false;
        if (response && response.success && response.data) {
          this.propertyDetail = response.data;
          this.allowEdit = this.userRole === 'pemilik' && this.userDetail.email === response.data.user_create;
          if (response.data.units && Array.isArray(response.data.units)) {
            this.units = response.data.units.map((unit: any) => ({
              id: unit.id,
              roomName: unit.unit_name,
              price: unit.price,
              propimage: (unit.photos && unit.photos.length > 0) ? unit.photos[0].file_path : '',
              status: unit.available ? 1 : 2
            }));
          } else {
            this.units = [];
          }
          // Inisialisasi images: thumbnail + photos unik
          const photoArr = Array.isArray(this.propertyDetail?.photos)
            ? this.propertyDetail.photos.map((p: any) => p.file_path)
            : [];
          const thumb = this.propertyDetail?.thumbnail_photo_path;
          this.images = thumb ? [thumb, ...photoArr.filter((p: string) => p !== thumb)] : photoArr;
        }
      }, (error) => {
        this.isLoading = false;
        // this.alertService.error((error?.error as any)?.message || 'Gagal mengambil detail properti.');
      });
    }
  }

  ngOnInit() {
    this.getPropertyDetail();
    this.updateUserDetail();
  }

  goBack(): void {
    this.location.back();
  }

  goToDetails(id: any) {
    this.route.navigate(['/property-detail', id]);
  }

  goToRoomDetails(id: any) {
    this.route.navigate(['/room-detail', id]);
  }

  goToAddUnit() {
    if (this.propertyDetail && this.propertyDetail.id) {
      this.route.navigate(['/add-unit', this.propertyDetail.id]);
    }
  }

  openAddFacilityDialog() {
    const dialogRef = this.dialog.open(AddFacilityDialogComponent, {
      width: '500px',
      data: {
        propertyId: this.PropertyId,
        existingFacilities: this.propertyDetail?.facilities || []
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && Array.isArray(result)) {
        this.isLoading = true;
        this.propertyService.addFacilitiesToProperty(this.PropertyId, result).subscribe({
          next: (res) => {
            this.isLoading = false;
            this.alertService.success((res as any)?.message || 'Fasilitas berhasil ditambahkan!');
            this.getPropertyDetail(); // Refresh detail after adding facility
          },
          error: (err) => {
            this.isLoading = false;
            this.alertService.error((err?.error as any)?.message || 'Gagal menambahkan fasilitas.');
          }
        });
      }
    });
  }

  async openAddPropertyPhotoDialog() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async (event: any) => {
      const files: FileList = event.target.files;
      if (!files || files.length === 0) return;
      const photoPayload: any[] = [];
      this.isLoading = true;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Upload ke Cloudinary
        const uploadRes = await this.cloudinaryService.uploadImage(file).toPromise();
        // Dapatkan dimensi gambar
        const imgDims = await this.getImageDimensions(file);
        photoPayload.push({
          file_name: file.name,
          file_path: uploadRes.secure_url,
          width: imgDims.width,
          height: imgDims.height
        });
      }
      // POST ke backend pakai propertyService
      this.propertyService.addPhotosToProperty(this.PropertyId, photoPayload).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.alertService.success((res as any)?.message || 'Foto berhasil ditambahkan!');
          this.getPropertyDetail(); // Refresh detail after adding photo
        },
        error: (err) => {
          this.isLoading = false;
          this.alertService.error((err?.error as any)?.message || 'Gagal upload foto.');
        }
      });
    };
    input.click();
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

  getFacilityCategories(facilities: any[]): { category: string, items: any[] }[] {
    if (!facilities) return [];
    const grouped: { [key: string]: any[] } = {};
    facilities.forEach(fac => {
      const cat = fac.facility_category || 'Lainnya';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(fac);
    });
    return Object.keys(grouped).map(cat => ({ category: cat, items: grouped[cat] }));
  }

  get propertyPhotos(): any[] {
    return Array.isArray(this.propertyDetail?.photos) ? this.propertyDetail.photos : [];
  }

  // Tambahkan fungsi untuk viewer foto
  prev() {
    if (this.images.length > 0) {
      this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    }
  }

  next() {
    if (this.images.length > 0) {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
    }
  }

  openModal(image: string) {
    this.selectedImage = image;
  }

  closeModal() {
    this.selectedImage = null;
  }

  applyAsKeeper() {
    if (!this.PropertyId) return;
    this.propertyService.applyKeeper(this.PropertyId).subscribe({
      next: (res) => {
        this.alertService.success((res as any)?.message || 'Pengajuan sebagai penjaga telah dikirim!');
      },
      error: (err) => {
        this.alertService.error((err?.error as any)?.message || 'Gagal mengajukan sebagai penjaga.');
      }
    });
  }

  canApplyAsKeeper(): boolean {
    return this.userRole === 'penjaga' && !this.userDetail?.property_id?.includes(Number(this.PropertyId));
  }

  async onDeleteProperty() {
    if (!this.PropertyId) return;
    if (!confirm('Yakin ingin menghapus properti ini?')) return;
    this.isLoading = true;
    try {
      await this.propertyService.deleteProperty(this.PropertyId).toPromise();
      this.isLoading = false;
      this.snackBar.open('Properti berhasil dihapus!', 'Tutup', { duration: 3000 });
      this.route.navigate(['/property-list']);
    } catch (err) {
      this.isLoading = false;
      this.snackBar.open('Gagal menghapus properti.', 'Tutup', { duration: 3000 });
    }
  }

  openEditProperty() {
    if (this.propertyDetail && this.propertyDetail.id) {
      this.route.navigate(['/edit-property', this.propertyDetail.id]);
    }
  }

  leaveProperty(propertyId: number): void {
    if (this.isPenjaga) {
      this.propertyService.leaveKeeper(propertyId).subscribe((res: any) => {
        this.alertService.success(res?.message || 'Berhasil keluar sebagai penjaga!');
        if(this.allowRating()){
          this.openRatingDialog(propertyId);
        } else {
          this.ngOnInit();
        }
      }, (err: any) => {
        this.alertService.error(err?.error?.message || 'Gagal keluar sebagai penjaga.');
      });
    } else if (this.isPenghuni) {
      const dialogRef = this.dialog.open(DeletePropertyDialogComponent, {
        data: {
          title: 'Konfirmasi Keluar Kamar',
          message: 'Apakah Anda yakin ingin keluar dari kamar ini?'
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
          this.unitService.leaveUnit(propertyId).subscribe((res: any) => {
            this.alertService.success(res?.message || 'Berhasil keluar dari kamar!');
            if(this.allowRating()){
              this.openRatingDialog(propertyId);
            } else {
              this.ngOnInit();
            }
          }, (err: any) => {
            this.alertService.error(err?.error?.message || 'Gagal keluar dari kamar.');
          });
        }
      });
    }
  }

  openRatingDialog(propertyId: number): void {
    const dialogRef = this.dialog.open(RatingDialogComponent, { width: '350px' });
    dialogRef.afterClosed().subscribe((rating: number) => {
      if (rating >= 1 && rating <= 5) {
        this.propertyService.rateProperty(propertyId, rating).subscribe((res: any) => {
          this.alertService.success(res?.message || 'Terima kasih atas rating Anda!');
          this.ngOnInit(); // reload komponen setelah rating
        }, (err: any) => {
          this.alertService.error(err?.error?.message || 'Gagal mengirim rating.');
        });
      } else {
        this.ngOnInit(); // reload komponen meskipun user tidak memberi rating
      }
    });
  }

  updateUserDetail(): void {
    if(this.userDetail && this.userDetail.user_id){
      this.userService.getUserById(this.userDetail.user_id).subscribe((res: any) => {
        if(res && res.data){
          this.authService.setUser(res.data);
        }
      });
    }
  }

  allowLeave() {
    return (this.isPenghuni || this.isPenjaga) && this.userDetail.property_id.includes(Number(this.PropertyId));
  }

  allowRating() {
    return this.allowLeave() && !this.userDetail.rated_property_id.includes(Number(this.PropertyId));
  }

}
