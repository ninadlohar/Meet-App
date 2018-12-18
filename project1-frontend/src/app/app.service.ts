import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cookie } from 'ng2-cookies';


@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(public http: HttpClient) {
  }
  private url = 'http://localhost:3000';

  public signUpFunction(data): Observable<any> {
    const params = new HttpParams()
      .set('userName', data.userName)
      .set('firstName', data.firstName)
      .set('lastName', data.lastName)
      .set('mobileNumber', data.mobileNumber)
      .set('email', data.email)
      .set('password', data.password)
      .set('countryName', data.countryName)
      .set('isAdmin', data.isAdmin);
    return this.http.post(`${this.url}/api/v1/users/signup`, params);
  }

  public loginFunction(data): Observable<any> {
    const params = new HttpParams()
      .set('email', data.email)
      .set('password', data.password)
    return this.http.post(`${this.url}/api/v1/users/login`, params);
  }

  public forgotPassword(data): Observable<any> {
    const response = new HttpParams()
      .set('email', data.email)
    return this.http.post(`${this.url}/api/v1/users/forgotPassword`, response);
  }

  public getCountryPhone(): Observable<any> {
    const data = this.http.get('../assets/data.json');
    return data;
  }

  public getCountryNames(): Observable<any> {
    const data = this.http.get('../assets/countryNames.json');
    return data;
  }

  public resetPassword(data): Observable<any> {
    const params = new HttpParams()
      .set('userId', data.userId)
      .set('password', data.password)
    return this.http.post(`${this.url}/api/v1/users/resetPassword`, params);
  }

  public getUserInfoFromLocalstorage = () => {
    return JSON.parse(localStorage.getItem('userInfo'));
  }

  public setUserInfoInLocalStorage = (data) => {
    localStorage.setItem('userInfo', JSON.stringify(data))
  }

  public logout(userId, authToken): Observable<any> {
    const params = new HttpParams()
      .set('authToken', authToken)
    return this.http.post(`${this.url}/api/v1/users/logout/${userId}`, params)
  }

  public getUsers(authToken): Observable<any> {
    return this.http.get(`${this.url}/api/v1/users/view/all?authToken=${authToken}`);
  }

  public createMeeting(data): Observable<any> {
    const params = new HttpParams()
      .set('title', data.title)
      .set('startDate', data.startDate)
      .set('endDate', data.endDate)
      .set('createdBy', data.createdBy)
      .set('createdById', data.createdById)
      .set('createdByEmail', data.createdByEmail)
      .set('createdFor', data.createdFor)
      .set('createdForEmail', data.createdForEmail)
      .set('authToken', data.authToken)
    return this.http.post(`${this.url}/api/v1/meeting/createMeeting`, params)
  }

  public getAllMeetings(userId, authToken): Observable<any> {
    return this.http.get(`${this.url}/api/v1/meeting/allMeetings/${userId}?authToken=${authToken}`)
  }

  public getSelectedMeeting(createdById, createdFor, authToken): Observable<any> {
    return this.http.get(`${this.url}/api/v1/meeting/getMeetingOnClick?createdById=${createdById}&createdFor=${createdFor}&authToken=${authToken}`)
  }

  public updateMeeting(data): Observable<any> {
    const params = new HttpParams()
      .set('title', data.title)
      .set('startDate', data.startDate)
      .set('endDate', data.endDate)
      .set('authToken', data.authToken)
    return this.http.put(`${this.url}/api/v1/meeting/updateMeeting/${data.meetingId}`, params)
  }

  public getSingleMeetingDetails(meetingId, authToken): Observable<any> {
    return this.http.get(`${this.url}/api/v1/meeting/getOneMeeting/${meetingId}?authToken=${authToken}`)
  }

  public getNormalMeetings(meetingId): Observable<any> {
    return this.http.get(`${this.url}/api/v1/meeting/getNormalMeetings/${meetingId}?authToken=${Cookie.get('authToken')}`)
  }

  public deleteMeeting(meetingId, authToken): Observable<any> {
    const params = new HttpParams()
      .set('authToken', authToken)
    return this.http.post(`${this.url}/api/v1/meeting/deleteMeeting/${meetingId}`, params)
  }

  //   app.post(`${baseUrl}/setReminder`, auth.isAuthorized, meetingController.setReminder)
  public setMeeting(userId): Observable<any> {
    const params = new HttpParams()
      .set('userId', userId)
    return this.http.post(`${this.url}/api/v1/meeting/setReminder?authToken=${Cookie.get('authToken')}`, params)
  }
}
