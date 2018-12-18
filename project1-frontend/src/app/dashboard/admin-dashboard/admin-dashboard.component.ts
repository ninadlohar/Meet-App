import { Component, ChangeDetectionStrategy, ViewChild, TemplateRef, OnInit } from '@angular/core';
import { startOfDay, endOfDay, subDays, addDays, endOfMonth, isSameDay, isSameMonth, addHours } from 'date-fns';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarView } from 'angular-calendar';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../app.service';
import { ToastrService } from 'ngx-toastr';
import { SocketService } from '../../socket.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { ColorPickerService } from 'ngx-color-picker';

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  }
};

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  @ViewChild('modalAlert') modalAlert: TemplateRef<any>;
  /** my thing over here */
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
  public allUsers: any[];
  public meetings: any = []
  public allUsersData: any[]
  public isAdmin: any
  public gentleReminder: Boolean = true;
  
  ngOnInit() {
    this.createdBy = Cookie.get('receiverName')
    this.createdById = Cookie.get('receiverId')
    this.createdByEmail = Cookie.get('receiverEmail')
    this.authToken = Cookie.get('authToken');
    this.userInfo = this.appService.getUserInfoFromLocalstorage()
    console.log(this.meetings)
    if (this.userInfo.isAdmin === true) {
      this.getAllUsersOnlineAndOffline()
      this.getAllMeetings()
    } else {
      this.router.navigate(['/user/normal/dashboard'])
    }
    setInterval(() => {
      this.meetingReminder()
    }, 5000)
  }

  @ViewChild('modalContent') modalContent: TemplateRef<any>;
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-fw fa-pencil"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      }
    }
  ];

  refresh: Subject<any> = new Subject();

  events: CalendarEvent[] = [];

  activeDayIsOpen: boolean = false;

  constructor(
    private modal: NgbModal,
    private router: Router,
    public appService: AppService,
    public toastr: ToastrService,
    public socketService: SocketService) { }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      this.viewDate = date;
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
    }
  }

  eventTimesChanged({ event, newStart, newEnd }: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    this.handleEvent('Dropped or resized', event);
    this.refresh.next();
  }

  handleEvent(action: string, event: any): void {
    this.modalData = { event, action };
    if (action == 'Edited') {
      this.router.navigate([`/user/admin/updateMeeting/${event.meetingId}`])
    } if (action == 'Deleted') {
      this.router.navigate([`/user/admin/dashboard`]);
    }
    // this.modal.open(this.modalContent, { size: 'lg' });
  }

  addEvent(): void {
    this.events.push({
      title: 'New event',
      start: startOfDay(new Date()),
      end: endOfDay(new Date()),
      color: colors.red,
      draggable: true,
      resizable: {
        beforeStart: true,
        afterEnd: true
      }
    });
    this.refresh.next();
  }

  public getAllUsersOnlineAndOffline() {
    if (this.authToken) {
      this.appService.getUsers(this.authToken)
        .subscribe((apiResponse) => {
          if (apiResponse.status === 200) {
            this.allUsersData = apiResponse.data
            this.allUsers = []
            for (let i = 0; i < this.allUsersData.length; i++) {
              let user = {
                name: this.allUsersData[i].firstName + ' ' + this.allUsersData[i].lastName,
                email: this.allUsersData[i].email,
                userId: this.allUsersData[i].userId,
                isAdmin: this.allUsersData[i].isAdmin
              }
              this.allUsers.push(user)
            }
          } else {
            this.toastr.error(apiResponse.message)
          }
        }, (error) => {
          this.toastr.error('something went wrong')
        })
    } else {
      this.toastr.info('authorization token missing, try logging in again')
      this.router.navigate(['/login'])
    }
  }

  createMeetingLink() {
    this.router.navigate(['/user/admin/create-meeting'])
  }

  public getAllMeetings(): any {
    this.appService.getAllMeetings(this.createdById, this.authToken)
      .subscribe((data) => {
        if (data.status === 200) {
          this.meetings = data.data
          for (let event of this.meetings) {
            event.title = event.title
            event.start = new Date(event.startDate)
            event.end = new Date(event.endDate)
            event.color = event.color
            event.actions = this.actions
            event.remindMe = true
          }
          this.events = this.meetings
          this.refresh.next();
          console.log(this.events)
        } else {
          this.toastr.error(data.message)
        }
      }, (error) => {
        this.toastr.error('something went wrong')
      })
  }

  public displaySelectedUser(id) {
    this.appService.getSelectedMeeting(this.createdById, id, this.authToken)
      .subscribe((data) => {
        if (data.status === 200) {
          this.meetings = data.data
          for (let event of this.meetings) {
            event.title = event.title
            event.start = new Date(event.startDate)
            event.end = new Date(event.endDate)
            event.color = event.color
            event.actions = this.actions
            event.remindMe = true
          }
          this.events = this.meetings
          this.refresh.next();
          console.log(this.events)
        } else {
          this.toastr.error(data.message)
        }
      }, (error) => {
        this.toastr.error('something went wrong')
      })
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

  /** this function will send reminders to normal users regarding meeting schedulded activates onClick() */
  public setMeetingReminder() {
    this.appService.setMeeting(this.createdById)
      .subscribe((apiResponse) => {
        if (apiResponse.status === 200) {
          this.toastr.info('Meeting reminder is sent to normal users')
        } else {
          this.toastr.warning(apiResponse.message)
        }
      }, (error) => {
        this.toastr.error('something went wrong')
      })
  }

  public meetingReminder(): any {
    let currentTime = new Date().getTime();
    for (let meetingEvent of this.meetings) {
      if ((meetingEvent.start).getTime() - currentTime <= 60000) {
        if (meetingEvent.remindMe && this.gentleReminder) {
          this.toastr.info('One Minute to Start Meeting')
          this.modalData = { action: 'clicked', event: meetingEvent };
          this.modal.open(this.modalAlert, { size: 'sm' });
          this.gentleReminder = false
          break;     
        }      
      } else if(currentTime > (meetingEvent.start).getTime() && (currentTime - (meetingEvent.start).getTime()) < 12000) { // 2minutes after meeting started
        this.toastr.info('Meeting just Started')
      }     
    }
  }

}
