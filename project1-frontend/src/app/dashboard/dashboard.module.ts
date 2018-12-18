import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { FlatpickrModule } from 'angularx-flatpickr';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { NormalUserDashboardComponent } from './normal-user-dashboard/normal-user-dashboard.component';
import { RouterModule } from '@angular/router';
import { DemoModule } from './files/demo/module';
import { DemoComponent } from './files/demo/component';

@NgModule({
  declarations: [AdminDashboardComponent, NormalUserDashboardComponent],
  imports: [
    CommonModule,
    FormsModule,
    BrowserAnimationsModule,
    NgbModalModule,
    DemoModule,
    FlatpickrModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    RouterModule.forChild([
      { path: 'user/admin/dashboard', component: AdminDashboardComponent },
      { path: 'user/normal/dashboard', component: NormalUserDashboardComponent }
    ])
  ]
})
export class DashboardModule { }
