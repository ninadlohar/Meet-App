import { Component, OnInit } from '@angular/core';
import { AppService } from '../../app.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Cookie } from 'ng2-cookies';
import { SocketService } from '../../socket.service';

@Component({
  selector: 'app-update-meeting',
  templateUrl: './update-meeting.component.html',
  styleUrls: ['./update-meeting.component.css']
})
export class UpdateMeetingComponent implements OnInit {

  constructor(
    public appService: AppService,
    private toastr: ToastrService,
    public router: Router,
    public route: ActivatedRoute,
    public socketService: SocketService
  ) { }

  /** variables */
  public meetingId: any

  public title: String;
  public startDate: any;
  public endDate: any;
  public createdBy: any;
  public createdById: any;
  public createdByEmail: any;
  public userInfo: any;
  public authToken: any
  public createdFor: any; /* for this guy we are going to set meeting */
  public createdForEmail: any;
  public meetings: any;
  public oldTask: any

  ngOnInit() {
    this.meetingId = this.route.snapshot.paramMap.get('meetingId');
    this.createdBy = Cookie.get('receiverName')
    this.createdById = Cookie.get('receiverId')
    this.createdByEmail = Cookie.get('receiverEmail')
    this.authToken = Cookie.get('authToken');
    this.userInfo = this.appService.getUserInfoFromLocalstorage()
    console.log(this.meetingId)

    if (this.userInfo.isAdmin === true) {
      this.getSingleMeetingDetails()
    } else {
      this.router.navigate(['/user/normal/dashboard'])
    }
  }

  public validateDate(startDate: any, endDate: any): boolean {
    let start = new Date(startDate);
    let end = new Date(endDate);
    if (end < start) {
      return true;
    } else {
      return false;
    }
  }

  public getSingleMeetingDetails() {
    this.appService.getSingleMeetingDetails(this.meetingId, this.authToken)
      .subscribe((data) => {
        if (data.status === 200) {
          this.meetings = data.data
          console.log(this.meetings)
          this.toastr.success('Meeting Found')
          this.oldTask = this.title
          this.title = this.meetings.title
          this.createdBy = this.meetings.createdBy
          this.createdByEmail = this.meetings.createdByEmail
          this.createdById = this.meetings.createdById
          this.createdFor = this.meetings.createdFor
          this.createdForEmail = this.meetings.createdForEmail
          this.endDate = new Date(this.meetings.endDate)
          this.startDate = new Date(this.meetings.startDate)
        } else {
          this.toastr.warning(data.message)
        }
      }, (error) => {
        this.toastr.error('something went wrong')
      })
  }

  public validateTodayDate(startDate: Date): boolean {
    let start = new Date(startDate);
    let end: any = new Date();
    if (end > start) {
      return true;
    } else {
      return false;
    }
  }

  public updateMeeting() {
    if (!this.title) {
      this.toastr.warning('Title required')
    } else if (!this.startDate) {
      this.toastr.warning('Start Date is Required')
    } else if (!this.endDate) {
      this.toastr.warning('End Date is required')
    } else if(this.validateDate(this.startDate, this.endDate)) {
      this.toastr.warning('End Date/Time cannot be before Start Date/Time')
    } else if(this.validateTodayDate(this.startDate) && this.validateTodayDate(this.endDate)) {
      this.toastr.warning('Meeting cannot be Schedulded before time')
    } else {
      let data = {
        meetingId: this.meetingId,
        title: this.title,
        startDate: this.startDate.getTime(),
        endDate: this.endDate.getTime(),
        authToken: this.authToken // pops out invalid token
      }
      this.appService.updateMeeting(data)
        .subscribe((data) => {
          if (data.status === 200) {
            console.log(data)
            this.toastr.success('Meeting Updated Successfully')
            let notify = {
              message: `${this.title} has been updated by ${this.createdBy}`,
              userId: this.createdFor
            }
            this.notifyUpdateToNormalUser(notify)
            setTimeout(() => {
              this.router.navigate(['/user/admin/dashboard'])
            }, 500)
          } else {
            this.toastr.warning(data.message)
          }
        }, (error) => {
          this.toastr.error('Somethign went wrong')
        })
    }
  }

  public logout: any = (userId) => {
    this.appService.logout(userId, this.authToken)
      .subscribe((apiResponse) => {
        if (apiResponse.status === 200) {
          console.log("logout called")
          Cookie.delete('authToken');
          Cookie.delete('receiverId');
          Cookie.delete('receiverName');
          this.socketService.disconnectedSocket()
          this.socketService.exitSocket()
          this.router.navigate(['/']);
        } else {
          this.toastr.error(apiResponse.message)
        }
      }, (err) => {
        this.toastr.error('some error occured')
      });
  }

  public deleteMeeting(meetingId) {
    this.appService.deleteMeeting(meetingId, this.authToken)
      .subscribe((data) => {
        if (data.status === 200) {
          this.toastr.success('Meeting deleted successfully')
          let notify = {
            message: `${this.title} has been deleted by ${this.createdBy}`,
            userId: this.createdFor
          }
          this.notifyUpdateToNormalUser(notify)
          setTimeout(() => {
            this.router.navigate(['/user/admin/dashboard'])
          }, 500)
        } else {
          this.toastr.warning(data.message)
        }
      }, (err) => {
        this.toastr.error('something went wrong')
      })
  }

  public notifyUpdateToNormalUser(data): any {
    this.socketService.notifyUpdates(data)
  }

}
