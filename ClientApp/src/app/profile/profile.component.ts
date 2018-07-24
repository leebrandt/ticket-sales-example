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
  user: any;
  ticket: string;

  constructor(private oktaAuth: OktaAuthService) {}

  async ngOnInit() {
    this.user = await this.oktaAuth.getUser();
    if (this.user.groups.includes('FullAttendees')) {
      this.ticket = 'Full Conference + Workshop';
    } else if (this.user.groups.includes('ConferenceOnlyAttendees')) {
      this.ticket = 'Conference Only';
    } else if (this.user.groups.includes('WorkshopOnlyAttendees')) {
      this.ticket = 'Workshop Only';
    } else {
      this.ticket = 'None';
    }
  }
}
