import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  public model: any;

  public errorMessage: string = '';
  public successMessage: string = '';

  constructor(
    private http: HttpClient,
    @Inject('BASE_URL') private baseUrl: string
  ) {
    this.resetModel();
  }

  resetModel(): any {
    this.model = {
      firstName: '',
      lastName: '',
      emailAddress: '',
      password: '',
      card: { number: '', exp_month: '', exp_year: '', cvc: '' },
      token: '',
      ticket: { ticketType: '', price: 0 }
    };
  }

  selectTicket(ticketType: string, price: number) {
    this.model.ticket = { ticketType, price: price * 100 };
  }

  purchaseTicket() {
    (<any>window).Stripe.card.createToken(
      this.model.card,
      (status: number, response: any) => {
        if (status === 200) {
          this.model.token = response.id;
          this.http
            .post(this.baseUrl + 'api/registration', this.model)
            .subscribe(
              result => {
                this.resetModel();
                this.successMessage = 'Thank you for purchasing a ticket!';
              },
              error => console.error(error)
            );
        } else {
          this.errorMessage = 'There was a problem purchasing the ticket.';
          console.error(response.error.message);
        }
      }
    );
  }
}
