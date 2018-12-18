import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { UserModule } from './user/user.module';
import { MeetingModule } from './meeting/meeting.module';
import { AppService } from './app.service';
import { LoginComponent } from './user/login/login.component';
import { Routes, RouterModule } from '@angular/router';
import { DashboardModule } from './dashboard/dashboard.module';

const routes: Routes = [
  { path: 'login', component: LoginComponent, pathMatch: 'full' },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '*', component: LoginComponent },
  { path: '**', component: LoginComponent }
];

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    UserModule,
    MeetingModule,
    DashboardModule,
  ],
  providers: [AppService],
  bootstrap: [AppComponent]
})
export class AppModule { }
