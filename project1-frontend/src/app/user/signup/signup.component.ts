import { Component, OnInit } from '@angular/core';
import { AppService } from '../../app.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  public firstName: any;
  public lastName: any;
  public email: any;
  public userName: any;
  public password: any;
  public country: any;
  public mobileNumber: any;
  public isAdmin: boolean;

  public countryName: string;
  public allCountries: any;
  public countryCode: string;
  public countries: any[] = [];
  public countryCodes: string[];



  constructor(
    public appService: AppService,
    public router: Router,
    private toastr: ToastrService) { }

  ngOnInit() {
    this.getCountriesList()
    this.getCountryPhone()
  }

  public goToSignIn: any = () => {
    this.router.navigate(['/']);
  } // end goToSignIn

  public signUpFunction: any = () => {
    if (!this.userName) {
      this.toastr.warning('enter username')
    } else if (!this.firstName) {
      this.toastr.warning('enter first name')
    } else if (!this.lastName) {
      this.toastr.warning('enter last name')
    } else if (!this.mobileNumber) {
      this.toastr.warning('enter mobileNumber')
    } else if (!this.email) {
      this.toastr.warning('enter email')
    } else if (!this.password) {
      this.toastr.warning('enter password')
    } else {
      if (this.isAdmin === undefined || this.isAdmin === null)
        this.isAdmin = false
      let data = {
        firstName: this.firstName,
        lastName: this.lastName,
        mobileNumber: this.mobileNumber,
        email: this.email,
        password: this.password,
        userName: this.userName,
        isAdmin: this.isAdmin,
        countryName: this.countryName
      }
      console.log(data);
      this.appService.signUpFunction(data)
        .subscribe((apiResponse) => {
          console.log(apiResponse);
          if (apiResponse.status === 200) {
            this.toastr.success('Signup successful');
            setTimeout(() => {
              this.goToSignIn();
            }, 500);
          } else {
            this.toastr.error(apiResponse.message);
          }
        }, (err) => {
          this.toastr.error('some error occured');
        });
    } // end condition
  } // end signupFunction

  public isAdminOrNot = (x) => {
    if (String(x).includes('-admin')) {
      return false
    } else {
      return true
    }
  }

  public getCountryPhone() {
    this.appService.getCountryPhone()
      .subscribe((data) => {
        this.countryCodes = data;
      })
  }

  public onChangeEvent() {
    this.countryCode = this.countryCodes[this.country];
    this.countryName = this.allCountries[this.country];
  }

  public getCountriesList() {
    this.appService.getCountryNames()
      .subscribe((data) => {
        this.allCountries = data;
        for (let x in data) {
          let singleCountryInfo = {
            name: data[x],
            code: x
          };
          this.countries.push(singleCountryInfo)
        }
        this.countries = this.countries.sort((first, second) => {
          return first.name.toUpperCase() < second.name.toUpperCase() ? -1 : (first.name.toUpperCase() > second.name.toUpperCase() ? 1 : 0);
        })
      })
  }

  public makeMeAdmin(event) {
    this.isAdmin = event
  }

}