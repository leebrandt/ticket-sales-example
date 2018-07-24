import { Component, OnInit } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { OktaAuthService } from '@okta/okta-angular';
import 'rxjs/Rx';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  ticket: string;
  constructor(private oktaAuth: OktaAuthService, private http: Http) {}

  async ngOnInit() {
    const accessToken = await this.oktaAuth.getAccessToken();
    const headers = new Headers({
      Authorization: 'Bearer ' + accessToken
    });
    this.http
      .get('/api/ticket', new RequestOptions({ headers: headers }))
      .map(res => res.json())
      .subscribe((ticket: string) => (this.ticket = ticket));
  }
}
