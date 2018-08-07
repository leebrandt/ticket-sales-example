import { Component, Inject } from '@angular/core';
import { Http } from '@angular/http';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  public model: any;
  public card: any;

  public error: boolean;
  public errorMessage: string;
  public success: boolean;
  public successMessage: string;

  constructor(private http: Http, @Inject('BASE_URL') private baseUrl: string) {
    this.resetModel();
    this.successMessage = this.errorMessage = null;
    this.success = this.error = false;
  }

  resetModel(): any {
    this.model = {
      firstName: '',
      lastName: '',
      emailAddress: '',
      password: '',
      token: '',
      ticket: { ticketType: '', price: 0 }
    };
    this.card = { number: '', exp_month: '', exp_year: '', cvc: '' };
  }

  selectTicket(ticketType: string, price: number) {
    this.model.ticket = { ticketType, price: price * 100 };
  }

  purchaseTicket() {
    (<any>window).Stripe.card.createToken(
      this.card,
      (status: number, response: any) => {
        if (status === 200) {
          this.model.token = response.id;
          this.http
            .post(this.baseUrl + 'api/registration', this.model)
            .map(result => result.json())
            .subscribe(
              result => {
                this.resetModel();
                this.successMessage = 'Thank you for purchasing a ticket!';
                this.success = true;
                console.log(this.successMessage);
              },
              error => {
                this.errorMessage = 'There was a problem registering you.';
                this.error = true;
                console.error(error);
              }
            );
        } else {
          this.errorMessage = 'There was a problem purchasing the ticket.';
          console.error(response.error.message);
        }
      }
    );
  }
}
