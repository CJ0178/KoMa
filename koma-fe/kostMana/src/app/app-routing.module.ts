import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import path from 'node:path';
import { LandingPageComponent } from './component/landing-page/landing-page.component';
import { APP_BASE_HREF } from '@angular/common';
import { LoginPageComponent } from './component/login-page/login-page.component';
import { RegisterPageComponent } from './component/register-page/register-page.component';
import { PropertyListComponent } from './component/property-list/property-list.component';
import { AboutUsComponent } from './component/about-us/about-us.component';
import { PropertyDetailComponent } from './component/property-detail/property-detail.component';
import { NotificationComponent } from './component/notification/notification.component';
import { RoomDetailComponent } from './component/room-detail/room-detail.component';
import { StatisticPageComponent } from './component/statistic-page/statistic-page.component';
import { PaymentPageComponent } from './component/payment-page/payment-page.component';
import { PopUpMidtransComponent } from './component/pop-up/pop-up-midtrans/pop-up-midtrans.component';
import { RegisterPropertyComponent } from './component/register-property/register-property.component';
import { ComplaintDetailComponent } from './component/complaint-page/complaint-detail/complaint-detail.component';
import { ComplainManagementComponent } from './component/complaint-page/complain-management/complain-management.component';
import { CreateComplaintComponent } from './component/complaint-page/create-complaint/create-complaint.component';
import { InputEmailComponent } from './input-email/input-email.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { NotificationDetailComponent } from './component/notification-detail/notification-detail.component';
import { AddUnitComponent } from './component/add-unit/add-unit.component';
import { UserProfileComponent } from './component/user-profile/user-profile.component';
import { MidtransFinishComponent } from './component/payment-page/midtrans-finish.component';
import { MidtransErrorComponent } from './component/payment-page/midtrans-error.component';
import { EditPropertyComponent } from './component/edit-property/edit-property.component';
import { EditUnitComponent } from './component/edit-unit/edit-unit.component';
import { AddFinancialDialogComponent } from './component/statistic-page/add-financial-dialog.component';
import { EditComplaintComponent } from './component/complaint-page/edit-complaint/edit-complaint.component';

const routes: Routes = [
  {
    path: '', redirectTo: '/landing-page', pathMatch:'full'
  },
  {
    path: 'landing-page', component:LandingPageComponent
  },
  {
    path: 'login', component:LoginPageComponent
  },
  {
    path: 'register', component: RegisterPageComponent
  },
  {
    path: 'complain-page', component: ComplainManagementComponent
  },
  {
    path: 'complain-page/:id', component: ComplaintDetailComponent
  },
  {
    path: 'property-list', component: PropertyListComponent
  },
  {
    path: 'about-us', component: AboutUsComponent
  },
  {
    path: 'property-detail/:id', component: PropertyDetailComponent
  },
  {
    path: 'property-detail/:id/:room', component: RoomDetailComponent
  },
  {
    path: 'notification', component: NotificationComponent
  },
  {
    path: 'notification/:id', component: NotificationDetailComponent
  },
  {
    path: 'statistik', component: StatisticPageComponent
  },
  {
    path: 'payment', component: PaymentPageComponent
  },
  {
    path: 'register-property', component: RegisterPropertyComponent
  },
  {
    path: 'create-complaint', component: CreateComplaintComponent
  },
  {
    path: 'input-email', component: InputEmailComponent
  },
  {
    path: 'forgot-password/:id', component: ForgotPasswordComponent
  },
  {
    path: 'room-detail/:id', component: RoomDetailComponent
  },
  {
    path: 'add-unit/:propertyId', component: AddUnitComponent
  },
  {
    path: 'user-profile', component: UserProfileComponent
  },
  {
    path: 'midtrans-finish', component: MidtransFinishComponent
  },
  {
    path: 'midtrans-error', component: MidtransErrorComponent
  },
  {
    path: 'edit-property/:id', component: EditPropertyComponent
  },
  {
    path: 'edit-unit/:id', component: EditUnitComponent
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./component/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'add-financial', component: AddFinancialDialogComponent
  },
  {
    path: 'edit-complaint/:id', component: EditComplaintComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
