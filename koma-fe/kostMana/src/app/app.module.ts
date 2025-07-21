import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { GalleryModule, GALLERY_CONFIG, GalleryConfig } from 'ng-gallery';
import { LIGHTBOX_CONFIG, LightboxConfig } from 'ng-gallery/lightbox';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './component/landing-page/landing-page.component';
import { LoginPageComponent } from './component/login-page/login-page.component';
import { RegisterPageComponent } from './component/register-page/register-page.component';
import { NavigationBarComponent } from './component/navigation-bar/navigation-bar.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RoomDetailComponent } from './component/room-detail/room-detail.component';
import { PropertyDetailComponent } from './component/property-detail/property-detail.component';
import { PropertyListComponent } from './component/property-list/property-list.component';
import { AboutUsComponent } from './component/about-us/about-us.component';
import { NotificationComponent } from './component/notification/notification.component';
import { PopupNotificationComponent } from './component/pop-up/popup-notification/popup-notification.component';
import { PaymentPageComponent } from './component/payment-page/payment-page.component';
import { StatisticPageComponent } from './component/statistic-page/statistic-page.component';
import { HttpClientModule } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { provideHttpClient } from '@angular/common/http';
import { MapPopupComponent } from './component/pop-up/map-popup/map-popup.component';
import { AddExpenseDetailComponent } from './component/add-expense-detail/add-expense-detail.component';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { PopUpMidtransComponent } from './component/pop-up/pop-up-midtrans/pop-up-midtrans.component';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule, DatePipe } from '@angular/common';
import { NotifDialogComponent } from './component/pop-up/notif-dialog/notif-dialog.component';
import { RegisterPropertyComponent } from './component/register-property/register-property.component';
import { ComplainManagementComponent } from './component/complaint-page/complain-management/complain-management.component';
import { ComplaintDetailComponent } from './component/complaint-page/complaint-detail/complaint-detail.component';
import { CreateComplaintComponent } from './component/complaint-page/create-complaint/create-complaint.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { InputEmailComponent } from './input-email/input-email.component';
import { NotificationDetailComponent } from './component/notification-detail/notification-detail.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { GamificationComponent } from './component/gamification/gamification.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './service/auth.interceptor';
import { AddUnitComponent } from './component/add-unit/add-unit.component';
import { UserProfileComponent } from './component/user-profile/user-profile.component';
import { EditPropertyComponent } from './component/edit-property/edit-property.component';
import { AddFinancialDialogComponent } from './component/statistic-page/add-financial-dialog.component';
import { AddFacilityDialogComponent } from './component/pop-up/add-facility-dialog/add-facility-dialog.component';
import { UsePointDialogComponent } from './component/payment-page/use-point-dialog.component';
import { AddNotificationDialogComponent } from './component/pop-up/add-notification-dialog.component';
import { ConfirmDeleteDialog } from './component/pop-up/confirm-delete-dialog.component';
import { LoadingOverlayComponent } from './component/loading-overlay/loading-overlay.component';
import { EditComplaintComponent } from './component/complaint-page/edit-complaint/edit-complaint.component';
import { DeletePropertyDialogComponent } from './component/property-list/delete-property-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    LoginPageComponent,
    RegisterPageComponent,
    NavigationBarComponent,
    RoomDetailComponent,
    ComplainManagementComponent,
    PropertyListComponent,
    AboutUsComponent,
    NotificationComponent,
    PopupNotificationComponent,
    PaymentPageComponent,
    StatisticPageComponent,
    MapPopupComponent,
    AddExpenseDetailComponent,
    PopUpMidtransComponent,
    NotifDialogComponent,
    RegisterPropertyComponent,
    ComplaintDetailComponent,
    PropertyDetailComponent,
    CreateComplaintComponent,
    ForgotPasswordComponent,
    InputEmailComponent,
    NotificationDetailComponent,
    GamificationComponent,
    AddUnitComponent,
    UserProfileComponent,
    EditPropertyComponent,
    AddFinancialDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatGridListModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    HttpClientModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatDividerModule,
    MatDialogModule,
    CommonModule,
    MatCheckboxModule,
    MatRadioModule,
    GalleryModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    AddFacilityDialogComponent,
    UsePointDialogComponent,
    AddNotificationDialogComponent,
    ConfirmDeleteDialog,
    LoadingOverlayComponent,
    DeletePropertyDialogComponent,
    EditComplaintComponent
  ],
  providers: [
    provideHttpClient(),
    DatePipe,
    {
      provide: GALLERY_CONFIG,
      useValue: {
        autoHeight: true,
        imageSize: 'cover'
      } as GalleryConfig
    },
    {
      provide: LIGHTBOX_CONFIG,
      useValue: {
        keyboardShortcuts: false,
        exitAnimationTime: 1000
      } as LightboxConfig
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
