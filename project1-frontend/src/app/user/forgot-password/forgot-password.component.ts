import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

  public email: string

  constructor(private router: Router,
    private toastr: ToastrService,
    public appService: AppService) { }

  public sendResetLink() {
    if (!this.email) {
      this.toastr.warning('email requried')
    } else {
      let data = {
        email: this.email
      };
      this.appService.forgotPassword(data)
        .subscribe((response) => {
          this.toastr.success('email send for resetting password')
          if (response.status === 200) {
            setTimeout(() => {
              this.router.navigate(['/login'])
            }, 500)
          } else {
            this.toastr.error(response.message)
          }
        }, (error) => {
          this.toastr.error('something went wrong')
        })
    }

  }

  ngOnInit() {
  }

  public login() {
    this.router.navigate(['/login'])
  }

  public signup() {
    this.router.navigate(['/sign-up'])
  }

}
