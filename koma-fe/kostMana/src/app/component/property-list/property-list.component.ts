import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { landingPropertyData } from '../landing-page/landing-page.component';
import { PropertyService } from '../../service/property.service';
import { AlertService } from '../../service/alert.service';
import { AuthService } from '../../service/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { DeletePropertyDialogComponent } from './delete-property-dialog.component';
import { UnitService } from '../../service/unit.service';
import { RatingDialogComponent } from './rating-dialog.component';
import { UserService } from '../../service/user.service';

@Component({
  selector: 'app-property-list',
  standalone: false,

  templateUrl: './property-list.component.html',
  styleUrl: './property-list.component.css'
})
export class PropertyListComponent {
  PropListData : landingPropertyData[] = [];
  isPemilik: boolean = false;
  isPenjaga: boolean = false;
  isPenghuni: boolean = false;
  isLoading: boolean = false;
  userId: number | null = null;
  userDetail: any;

  constructor(
    private location: Location,
    private PropService : PropertyService,
    private router: Router,
    private alertService: AlertService,
    private authService: AuthService,
    private dialog: MatDialog,
    private unitService: UnitService,
    private userService: UserService,
  ){
    this.authService.user$.subscribe(user => {
      this.isPemilik = user && user.role_id === 2;
      this.isPenjaga = user && user.role_id === 3;
      this.isPenghuni = user && user.role_id === 4;
      this.userId = user.id;
      this.userDetail = user;
    });
  }

  goBack(): void {
    this.location.back();
  }

  goToDetail(id: any) {
    this.router.navigate(['/property-detail', id]);
  }

  goToEdit(id: any) {
    this.router.navigate(['/edit-property', id]);
  }

  goToRegisterProperty() {
    this.router.navigate(['/register-property']);
  }

  ngOnInit(){
    this.isLoading = true;
    this.authService.user$.subscribe(user => {
      let propertyIds: number[] = [];
      if (user && (user.role_id === 3 || user.role_id === 4)) {
        // Penjaga or Penghuni: get property_id array
        propertyIds = Array.isArray(user.property_id) ? user.property_id : [];
        if (propertyIds.length === 0) {
          this.PropListData = [];
          this.isLoading = false;
          return;
        }
        let loaded = 0;
        let propertyDetails: any[] = [];
        propertyIds.forEach((propertyId: number) => {
          this.PropService.getPropertyById(propertyId).subscribe((res: any) => {
            if (res && res.data) {
              propertyDetails.push({
                id: res.data.id,
                name: res.data.property_name || res.data.namaProperti || '',
                type: res.data.property_type || res.data.jenisKos || '',
                price: res.data.price || 0,
                propimage: res.data.thumbnail_photo_path || res.data.propimage || 'https://i.pinimg.com/736x/bf/38/8f/bf388f2771f6b5f2fc4df3cc19fdf6ab.jpg',
                location: res.data.city || res.data.alamat || '',
                rating: res.data.rating || 0
              });
            }
            loaded++;
            if (loaded === propertyIds.length) {
              this.PropListData = propertyDetails;
              this.isLoading = false;
            }
          }, () => {
            loaded++;
            if (loaded === propertyIds.length) {
              this.PropListData = propertyDetails;
              this.isLoading = false;
            }
          });
        });
      } else {
        // Pemilik: show all owner properties
        this.PropService.getOwnerProperties().subscribe(res=>{
          this.isLoading = false;
          if (res && res.success && Array.isArray(res.data)) {
            this.PropListData = res.data.map((p: any) => ({
              id: p.id,
              name: p.property_name || p.namaProperti || '',
              type: p.property_type || p.jenisKos || '',
              price: p.price || 0,
              propimage: p.thumbnail_photo_path || p.propimage || 'https://i.pinimg.com/736x/bf/38/8f/bf388f2771f6b5f2fc4df3cc19fdf6ab.jpg',
              location: p.city || p.alamat || '',
              rating: p.rating || 0
            }));
          } else {
            this.PropListData = [];
          }
        }, err => {
          this.isLoading = false;
        });
      }
    });
  }

  confirmDelete(id: any) {
    const dialogRef = this.dialog.open(DeletePropertyDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.isLoading = true;
        this.PropService.deleteProperty(id).subscribe({
          next: (res) => {
            this.alertService.success(res?.message || 'Properti berhasil dihapus!');
            this.PropListData = this.PropListData.filter(p => p.id !== id);
            this.isLoading = false;
          },
          error: (err) => {
            this.alertService.error(err?.error?.message || 'Gagal menghapus properti.');
            this.isLoading = false;
          }
        });
      }
    });
  }

  leaveProperty(propertyId: number): void {
    const dialogRef = this.dialog.open(DeletePropertyDialogComponent, {
      data: {
        title: 'Konfirmasi Keluar Properti',
        message: 'Apakah Anda yakin ingin keluar dari properti ini?'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        if (this.isPenjaga) {
          this.PropService.leaveKeeper(propertyId).subscribe((res: any) => {
            this.alertService.success(res?.message || 'Berhasil keluar sebagai penjaga!');
            this.updateUserDetail();
            if(this.allowRating(propertyId)){
              this.openRatingDialog(propertyId);
            } else {
              this.ngOnInit();
            }
          }, (err: any) => {
            this.alertService.error(err?.error?.message || 'Gagal keluar sebagai penjaga.');
          });
        } else if (this.isPenghuni) {
          this.unitService.leaveUnit(propertyId).subscribe((res: any) => {
            this.alertService.success(res?.message || 'Berhasil keluar sebagai penghuni!');
            this.updateUserDetail();
            if(this.allowRating(propertyId)){
              this.openRatingDialog(propertyId);
            } else {
              this.ngOnInit();
            }
          }, (err: any) => {
            this.alertService.error(err?.error?.message || 'Gagal keluar sebagai penghuni.');
          });
        }
      }
    });
  }

  updateUserDetail(): void {
    if(this.userId){
      this.userService.getUserById(this.userId).subscribe((res: any) => {
        if(res && res.data){
          this.authService.setUser(res.data);
        }
      });
    }
  }

  openRatingDialog(propertyId: number): void {
    const dialogRef = this.dialog.open(RatingDialogComponent, { width: '350px' });
    dialogRef.afterClosed().subscribe((rating: number) => {
      if (rating >= 1 && rating <= 5) {
        this.PropService.rateProperty(propertyId, rating).subscribe((res: any) => {
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

  allowLeave(propertyId: number) {
    return (this.isPenghuni || this.isPenjaga) && this.userDetail.property_id.includes(Number(propertyId));
  }

  allowRating(propertyId: number) {
    return this.allowLeave(propertyId) && !this.userDetail.rated_property_id.includes(Number(propertyId));
  }
}
