import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { CreateMeetingComponent } from './create-meeting/create-meeting.component';
import { UpdateMeetingComponent } from './update-meeting/update-meeting.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { ColorPickerModule } from 'ngx-color-picker';

@NgModule({
  declarations: [CreateMeetingComponent, UpdateMeetingComponent],
  imports: [
    CommonModule,
    FormsModule,
    OwlDateTimeModule,
    ColorPickerModule,
    OwlNativeDateTimeModule,
    BrowserAnimationsModule,
    RouterModule.forChild([
      { path: 'user/admin/create-meeting', component: CreateMeetingComponent },
      { path: 'user/admin/updateMeeting/:meetingId', component: UpdateMeetingComponent }
    ])
  ],

})
export class MeetingModule { }
