import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ComplaintService } from '../../../service/complaint.service';
import { UserService } from '../../../service/user.service';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-complain-management',
  standalone: false,

  templateUrl: './complain-management.component.html',
  styleUrl: './complain-management.component.css'
})
export class ComplainManagementComponent implements OnInit {
  complaints: any[] = [];
  user: any = null;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private complaintService: ComplaintService,
    private userService: UserService,
    private authService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.authService.user$.subscribe((user: any) => {
      this.user = user;
    });
    this.fetchComplaints();
  }

  fetchComplaints() {
    this.isLoading = true;
    this.complaintService.getAllComplaints().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res.data) ? res.data : [res.data];
        this.complaints = (data || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          property_id: item.property_id,
          unit_id: item.unit_id,
          complainer_id: item.complainer_id,
          complainer_detail: item.complainer_detail, // store complainer_detail
          photos: item.photos || [],
          date_create: item.date_create,
          date_update: item.date_update,
          status: item.status // store status field
        }));
        this.isLoading = false;
      },
      error: () => {
        this.complaints = [];
        this.isLoading = false;
      }
    });
  }

  getComplaintDetail(id: number) {
    this.router.navigate(['complain-page', id]);
  }

  goToCreateComplaint() {
    this.router.navigate(['create-complaint']);
  }
}
