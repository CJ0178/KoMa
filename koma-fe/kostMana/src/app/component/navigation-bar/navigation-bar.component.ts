import { Component, EventEmitter, HostListener, Input, Output, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../service/auth.service';
import { NotificationService } from '../../service/notification.service';

@Component({
  selector: 'app-navigation-bar',
  standalone: false,

  templateUrl: './navigation-bar.component.html',
  styleUrl: './navigation-bar.component.css'
})
export class NavigationBarComponent implements OnInit {
  isLoggedIn = false;
  userName: string = '';

  constructor(
    private dialog: MatDialog,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private authService: AuthService,
    private notificationService: NotificationService
  ){}
  UserRole: string = '';

  @Input() isOpen = false;
  @Output() onClose = new EventEmitter<void>();

  sidenavOpen = false;
  notificationCount: number = 0;

  userDetail: any = null;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.user$.subscribe(userDetail => {
        this.isLoggedIn = !!userDetail;
        this.userDetail = userDetail;
        if (userDetail) {
          this.userName = userDetail.name || '';
          const roleId = userDetail.role_id;
          if (roleId === 2) {
            this.currentUserRole = 'pemilik';
          } else if (roleId === 3) {
            this.currentUserRole = 'penjaga';
          } else if (roleId === 4) {
            this.currentUserRole = 'penghuni';
          } else {
            this.currentUserRole = '';
          }
          // Ambil jumlah notifikasi
          this.notificationService.getUserNotifications().subscribe(res => {
            if (res && res.success && Array.isArray(res.data)) {
              this.notificationCount = res.data.length;
            } else {
              this.notificationCount = 0;
            }
          });
        } else {
          this.currentUserRole = '';
          this.notificationCount = 0;
        }
      });
    }
  }

  toggleSidenav() {
    this.sidenavOpen = !this.sidenavOpen;
  }

  // Menu items with role-based visibility
  menuItems = [
    { icon: 'home', label: 'Beranda', route: '/landing-page', roles: ['all'] },
    { icon: 'payment', label: 'Pembayaran', route: '/payment', roles: ['penghuni'] },
    { icon: 'feedback', label: 'Keluhan', route: '/complain-page', roles: ['penghuni', 'pemilik', 'penjaga'] },
    { icon: 'list', label: 'Kost List', route: '/property-list', roles: ['pemilik'] },
    { icon: 'list', label: 'Kost Yang Dihuni', route: '/property-list', roles: ['penghuni'] },
    { icon: 'list', label: 'Kost Yang Dijaga', route: '/property-list', roles: ['penjaga'] },
    { icon: 'bar_chart', label: 'Statistik', route: '/statistik', roles: ['pemilik','penjaga'] },
    { icon: 'info', label: 'Tentang Koma', route: '/about-us', roles: ['penghuni', 'pemilik'] }
  ];

  currentUserRole: string = ''; // This should be set based on your auth service

  openNotification() {
    this.router.navigate(['notification']);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (window.innerWidth > 768 && this.isOpen) {
      this.closeSidenav();
    }
  }

  closeSidenav() {
    this.onClose.emit();
  }

  shouldShowItem(itemRoles: string[]): boolean {
    return itemRoles.includes('all') || itemRoles.includes(this.currentUserRole);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.logout().subscribe({
        next: () => {
          this.authService.setUser(null);
          this.router.navigate(['/login']);
        },
        error: () => {
          this.authService.setUser(null);
          this.router.navigate(['/login']);
        }
      });
    }
  }

  goToProfile() {
    this.router.navigate(['/user-profile']);
  }
}
