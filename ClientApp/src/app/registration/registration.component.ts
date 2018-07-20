import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  public model: any = {
    firstName: '',
    lastName: '',
    email: '',
    card: { number: '', exp_month: '', exp_year: '', cvc: '' },
    selectedTicket: { ticket: '', price: 0 }
  };

  selectTicket(ticket: string, price: number) {
    this.model.selectedTicket = { ticket, price };
  }

  purchaseTicket() {
    this.getToken();
  }

  getToken() {
    (<any>window).Stripe.card.createToken(
      this.model.card,
      (status: number, response: any) => {
        if (status === 200) {
          console.log(`Success! Card token ${response.card.id}`);
        } else {
          console.error(response.error.message);
        }
      }
    );
  }
}
