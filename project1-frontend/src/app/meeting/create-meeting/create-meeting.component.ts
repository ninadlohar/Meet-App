import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Cookie } from 'ng2-cookies';
import { AppService } from 'src/app/app.service';
import { SocketService } from '../../socket.service';

@Component({
  selector: 'app-create-meeting',
  templateUrl: './create-meeting.component.html',
  styleUrls: ['./create-meeting.component.css']
})
export class CreateMeetingComponent implements OnInit {

  /** data to append on database for new meeting */
  public title: String;
  public startDate: any;
  public endDate: any;
  public createdBy: any;
  public createdById: any;
  public createdByEmail: any;
  public userInfo: any;
  public createdFor: any; /* for this guy we are going to set meeting */
  public createdForEmail: any;
  public authToken: String
  public allUsers: any[];
  public allUsersData: any[]

  @ViewChild('scrollMe', { read: ElementRef })
  public scrollToChatTop: boolean = false;
  public scrollMe: ElementRef;


  constructor(public router: Router, public toastr: ToastrService, public appService: AppService, public socketService: SocketService) { }

  ngOnInit() {
    this.createdBy = Cookie.get('receiverName')
    this.createdById = Cookie.get('receiverId')
    this.createdByEmail = Cookie.get('receiverEmail')
    this.authToken = Cookie.get('authToken');
    this.userInfo = this.appService.getUserInfoFromLocalstorage()

    if (this.userInfo.isAdmin === true) {
      this.getAllUsers()
    } else {
      this.router.navigate(['/user/normal/dashboard'])
    }
  }
  public displaySelectedUser(user) {
    console.log(user)
    this.createdFor = user
    this.toastr.info(`You have selected meeting with ${user.firstName} ${user.lastName}`)
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

  public validateTodayDate(startDate: Date): boolean {
    let start = new Date(startDate);
    let end: any = new Date();
    if (end > start) {
      return true;
    } else {
      return false;
    }
  }

  public createMeeting(): any {
    if (!this.startDate) {
      this.toastr.warning('Start Date Missing')
    } else if (!this.endDate) {
      this.toastr.warning('End Date Missing')
    } else if (!this.title) {
      this.toastr.warning('Title of Meeting is Required')
    } else if (!this.createdFor) {
      this.toastr.warning('Select the user for Meeting')
    } else {
      let data = {
        startDate: this.startDate.getTime(),
        endDate: this.endDate.getTime(),
        title: this.title,
        createdFor: this.createdFor.userId,
        createdForEmail: this.createdFor.email,
        createdBy: this.createdBy,
        createdByEmail: this.createdByEmail,
        createdById: this.createdById,
        authToken: this.authToken,
      }
      console.log(data)
      this.appService.createMeeting(data)
        .subscribe((apiResponse) => {
          if (apiResponse.status === 200) {
            this.toastr.success('meeting created')
            let notify = {
              message: `${this.title} has been created by ${this.createdBy}`,
              userId: data.createdFor
            }
            this.notifyUpdateToNormalUser(notify)
            setTimeout(() => {
              this.router.navigate(['/user/admin/dashboard'])
            }, 500)
          } else {
            this.toastr.error(apiResponse.message)
          }
        }, (error) => {
          this.toastr.error('something went wrong')
        })
    }
  }

  public getAllUsers() {
    if (this.authToken) {
      this.appService.getUsers(this.authToken)
        .subscribe((response) => {
          if (response.status === 200) {
            this.allUsersData = response.data // store every user data om allUsersData
            this.allUsers = [] // store the users to show 'em online
            for (let i = 0; i < this.allUsersData.length; i++) {
              let user = {
                name:
                  this.allUsersData[i].firstName + ' ' + this.allUsersData[i].lastName,
                email: this.allUsersData[i].email,
                userId: this.allUsersData[i].userId
              }
              this.allUsers.push(user)
            }
          } else {
            this.toastr.error(response.message)
          }
        }, (error) => {
          this.toastr.error('something went wrong')
          console.log(error)
        })
    } else {
      this.toastr.info('authorization token missing, try logging in again')
      this.router.navigate(['/login'])
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

  public goBack() {
    this.router.navigate(['/user/admin/dashboard'])
  }

  public notifyUpdateToNormalUser(data): any {
    this.socketService.notifyUpdates(data)
  }



}
