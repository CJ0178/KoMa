import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComplaintService } from '../../../service/complaint.service';
import { AuthService } from '../../../service/auth.service';
import { CloudinaryService } from '../../../service/cloudinary.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-complaint-detail',
  standalone: false,

  templateUrl: './complaint-detail.component.html',
  styleUrl: './complaint-detail.component.css'
})
export class ComplaintDetailComponent implements OnInit {
  complaint: any = null;
  isLoading: boolean = true;
  isError = false;
  userId: number | null = null;
  userRole: string | null = null;
  canEdit = false;
  canSetStatus: boolean = false;

  // Carousel state
  carouselOpen = false;
  carouselIndex = 0;

  // Dialog state
  editDialogOpen = false;
  deleteDialogOpen = false;
  editForm: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private complaintService: ComplaintService,
    private authService: AuthService,
    private cloudinaryService: CloudinaryService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.userId = user?.id || user?.user_id || null;
      this.userRole = user?.role || user?.role_id || null;
      this.checkEditPermission();
      this.checkStatusPermission();
    });
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isLoading = true;
      this.complaintService.getComplaintById(id).subscribe({
        next: (res) => {
          this.snackBar.open(res?.message || 'Detail komplain berhasil diambil!', 'Tutup', { duration: 3000 });
          this.complaint = res.data;
          this.isLoading = false;
          this.checkEditPermission();
        },
        error: (err) => {
          this.snackBar.open(err?.error?.message || 'Gagal mengambil detail komplain.', 'Tutup', { duration: 3000 });
          this.isError = true;
          this.isLoading = false;
        }
      });
    } else {
      this.isError = true;
      this.isLoading = false;
    }
  }

  checkEditPermission() {
    if (this.complaint && this.userId) {
      if(this.complaint.status === 'MENUNGGU_TANGGAPAN'){
        this.canEdit = this.complaint.complainer_id == this.userId;
      }
    }
  }

  checkStatusPermission() {
    // role_id: 2 = pemilik, 3 = penjaga, atau string 'pemilik'/'penjaga'
    const allowed = [2, 3, 'pemilik', 'penjaga'];
    this.canSetStatus = this.userRole !== null && allowed.includes(this.userRole);
  }

  openCarousel(index: number) {
    this.carouselIndex = index;
    this.carouselOpen = true;
  }

  closeCarousel() {
    this.carouselOpen = false;
  }

  prevCarousel(event: Event) {
    event.stopPropagation();
    if (this.carouselIndex > 0) {
      this.carouselIndex--;
    }
  }

  nextCarousel(event: Event) {
    event.stopPropagation();
    if (this.complaint && this.carouselIndex < this.complaint.photos.length - 1) {
      this.carouselIndex++;
    }
  }

  // Dialog logic
  openEditDialog() {
    this.router.navigate(['/edit-complaint', this.complaint.id]);
  }
  closeEditDialog() {
    this.editDialogOpen = false;
  }
  openDeleteDialog() {
    this.deleteDialogOpen = true;
  }
  closeDeleteDialog() {
    this.deleteDialogOpen = false;
  }

  onEditPhotoChange(event: any) {
    const files = event.target.files;
    if (files && files.length) {
      this.editForm.newPhotos = Array.from(files);
      this.editForm.newPhotosPreview = [];
      (this.editForm.newPhotos as File[]).forEach((file: File, idx: number) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.editForm.newPhotosPreview[idx] = e.target.result;
        };
        reader.readAsDataURL(file);
      });
    } else {
      this.editForm.newPhotos = [];
      this.editForm.newPhotosPreview = [];
    }
  }

  async submitEdit() {
    this.isLoading = true;
    let photoPayload: any[] = [];
    if (this.editForm.newPhotos && this.editForm.newPhotos.length) {
      // Upload semua foto ke cloudinary
      const uploadPromises = (this.editForm.newPhotos as File[]).map(file =>
        this.cloudinaryService.uploadImage(file).toPromise()
      );
      const uploadResults = await Promise.all(uploadPromises);
      photoPayload = uploadResults.map((res: any) => ({
        file_name: res.original_filename,
        file_path: res.secure_url,
        width: res.width,
        height: res.height
      }));
    }
    // Payload sesuai ComplaintDTO
    const payload: any = {
      title: this.editForm.title,
      description: this.editForm.description,
      photos: photoPayload
    };
    this.complaintService.updateComplaint(this.complaint.id, payload).subscribe({
      next: (res) => {
        this.snackBar.open(res?.message || 'Komplain berhasil diupdate!', 'Tutup', { duration: 3000 });
        this.complaint = res.data;
        this.editDialogOpen = false;
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open(err?.error?.message || 'Gagal update komplain.', 'Tutup', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  confirmDelete() {
    this.isLoading = true;
    this.complaintService.deleteComplaint(this.complaint.id).subscribe({
      next: () => {
        this.snackBar.open('Keluhan berhasil dihapus', 'Tutup', { duration: 3000 });
        this.deleteDialogOpen = false;
        this.isLoading = false;
        window.location.href = '/complain-page';
      },
      error: () => {
        this.snackBar.open('Gagal menghapus keluhan', 'Tutup', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  setOnProgress() {
    this.isLoading = true;
    this.complaintService.setOnProgress(this.complaint.id).subscribe({
      next: (res: any) => {
        this.complaint = res.data;
        alert('Status diubah menjadi MASIH_DIKERJAKAN');
        this.isLoading = false;
      },
      error: () => {
        alert('Gagal mengubah status');
        this.isLoading = false;
      }
    });
  }

  setDone() {
    this.isLoading = true;
    this.complaintService.setDone(this.complaint.id).subscribe({
      next: (res: any) => {
        this.complaint = res.data;
        alert('Status diubah menjadi SELESAI');
        this.isLoading = false;
      },
      error: () => {
        alert('Gagal mengubah status');
        this.isLoading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
