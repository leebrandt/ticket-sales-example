# Building a Ticket Sales App with ASP.NET Core 2.1 and Angular 6

As a conference organizer, you need to sell tickets (even if they're free tickets). Them more tickets you sell, the more sponsors want to be involved. The more sponsors you have, the nicer the venue can be, the better the food and the more cool stuff you can do for speakers and attendees.

Most of the time, using a ticketing system live Eventbrite can be a satisfactory solution. But as your conference grows, you may find paying back a portion of each sale back to the ticketing software (when **you** are a software developer) can be frustrating and expensive.

Sooner or later, you will find yourself wanting to build your own ticketing system. If ASP.NET Core and Angular 6 is your preferred development stack, let me show you how to build that.

## Upgrade to Angular 6

I love to use the latest and greatest when starting a new project. But when you use a project generator (like Angular-CLI, or the DotNetCLI) you may be at the mercy of the latest version the authors of those libraries have added. Right now, the DotNetCLI

### Upgrade the Angular App Template

Update the DotNet command line tools with:

```bash
dotnet new --install Microsoft.DotNet.Web.Spa.ProjectTemplates::2.1.0
```

Then run:

```bash
dotnet new --install Microsoft.AspNetCore.SpaTemplates::2.1.0-preview1-final
```

### Generate the ASP.NET Angular App

Now you can scaffold a new project:

```bash
dotnet new angular -o ticket-sales-example
```

### Upgrade the Angular App To 6

But the closest that gets you is Angular v5.2.0. To update Angular to v6.0.9 (as of this writing) switch to the `ClientApp` directory and run:

```bash
ng update --all
```

This will update the `package.json` file, then you just need to run:

```bash
npm install
```

If you get a message about `@angular/cli` you can update it buy running:

```bash
ng update @angular/cli
```

You may now see some vulnerabilities in your NPM packages. To fix them run:

```bash
npm audit fix
```

You may have to run this several times as some of the fixes introduce new vulnerabilities. I was only able to get my vulnerability list down to 6. I still have 1 low and 5 moderate vulnerabilities. If you want to get to zero vulnerabilities, you would have to hunt them each down and fix them manually.

## Create a Stripe Account

One of the easiest ways to take payments on the web is to use [Stripe](https://stripe.com/). You can create a free developer account on Stripe's [registration page](https://dashboard.stripe.com/register).

Once you've registered, make sure that you go to your dashboard and on the left-hand menu, click the toggle to ensure you are viewing test data. Then click on the **Developers** menu item and then click **API Keys**. Copy down the **Publishable key** to use in your Angular app.

## Add Stripe to Your Angular 6 App

In your `index.html` file, add a script tag for Stripe's JavaScript library, right below the `app-root` component.

```ts
<script type="text/javascript" src="https://js.stripe.com/v2/" />
```

Also add your publishable key to the Stripe object:

```ts
<script type="text/javascript">
  Stripe.setPublishableKey('{yourPublishableKey}');
</script>
```

> Make sure that your publishable key starts with `pk_test_`. If it doesn't, you're using the production key, and you don't want to do that... yet.

## Create the Stripe Ticket Registration Page

You can easily scaffold the base registration component with the Angular CLI. Go to a command line and change directories into the `src/app` directory. Then run the command:

```bash
ng generate component registration
```

The shorthand for the CLI is:

```bash
ng g c registration
```

The generate command will generate a folder called `registration`, and inside that a `registration.compomnent.css`, `registration.component.html`, a `registration.component.spec.ts`, and a `registration.component.ts` file. These are all the basic files for an Angular 6 component. I won't be covering testing in this tutorial, so you can ignore or delete the `registration.component.spec.ts` file.

First, add some basic HTML to your `registration.component.html` file for displaying tickets. So the final file contents looks like this:

```html
<h1>Register for SuperDuperConf</h1>

<div class="ticket conf-only">
  <span class="title">Conference Only Pass</span>
  <span class="price">$295</span>
  <button (click)="selectTicket('Conference Only', 295)">Register Now!</button>
</div>

<div class="ticket full">
  <span class="title">Full Conference + Workshop Pass</span>
  <span class="price">$395</span>
  <span class="value">Best Value!</span>
  <button (click)="selectTicket('Full Conference + Workshop', 395)">Register Now!</button>
</div>

<div class="ticket work-only">
  <span class="title">Workshop Only Pass</span>
  <span class="price">$195</span>
  <button (click)="selectTicket('Workshop Only', 195)">Register Now!</button>
</div>

<div class="alert alert-success" *ngIf="model.successMessage">{{successMessage}}</div>
<div class="alert alert-danger" *ngIf="model.errorMessage">{{errorMessage}}</div>

<div *ngIf="model.ticket.price">

  <form (submit)="purchaseTicket()" class="needs-validation" novalidate #regForm="ngForm">
    <div class="form-group">
      <label for="firstName">First Name:</label>
      <input type="text" class="form-control" name="firstName" id="firstName" [(ngModel)]="model.firstName" required #firstName="ngModel">
      <div [hidden]="firstName.valid || firstName.pristine" class="text-danger">First Name is required.</div>
    </div>

    <div class="form-group">
      <label for="lastName">Last Name:</label>
      <input type="text" class="form-control" name="lastName" id="lastName" [(ngModel)]="model.lastName" required #lastName="ngModel">
      <div [hidden]="lastName.valid || lastName.pristine" class="text-danger">Last Name is required.</div>
    </div>

    <div class="form-group">
      <label for="email">Email Address:</label>
      <input type="text" class="form-control" name="email" id="email" [(ngModel)]="model.emailAddress" required #email="ngModel">
      <div [hidden]="email.valid || email.pristine" class="text-danger">Email Address is required.</div>
    </div>

    <div class="form-group">
      <label for="password">Password:</label>
      <input type="password" class="form-control" name="password" id="password" [(ngModel)]="model.password" required #password="ngModel">
      <div [hidden]="password.valid || password.pristine" class="text-danger">Password is required.</div>
    </div>

    <div class="form-group">
      <label for="cardNumber">Card Number:</label>
      <input type="text" class="form-control" name="cardNumber" id="cardNumber" [(ngModel)]="model.card.number" required>
    </div>

    <div class="form-group form-inline">
      <label for="expiry">Expiry:</label>
      <br/>
      <input type="text" class="form-control mb-1 mr-sm-1" name="expiryMonth" id="expiryMonth" [(ngModel)]="model.card.exp_month"
        required> /
      <input type="text" class="form-control" name="expiryYear" id="expiryYear" [(ngModel)]="model.card.exp_year" required>
    </div>

    <div class="form-group">
      <label for="cvc">Security Code:</label>
      <input type="text" class="form-control" name="cvc" id="cvc" [(ngModel)]="model.card.cvc" required>
    </div>
    <button type="submit" class="btn btn-success" [disabled]="!regForm.form.valid">Pay ${{model.ticket.price / 100}}</button>
  </form>
</div>
```

I know it seems like a lot, but there is a lot of repetition here. The first section lists three tickets that a use can buy to register for the "SuperDuperConf". The second section is just a form that collects the information needed to register an attendee for the conference.

The important thing to take note of here is the `[(ngModel)]="model.some.thing"` lines of code. That weird sequence of characters around `ngModel` is just parentheses inside of square brackets. The parentheses tell Angular that there is an action associated with this field. You see this alot for click event handlers. It usually looks something like `(click)="someEventHandler()"`. This is kind of the same, in that the `ngModel` is the handler of the event when the model changes.

The square brackets are used for updating the DOM when something on the model changes. It is usually seen in something like disabling a button like you did above with `[disabled]="!regForm.form.valid"`. It watches the value on the form, and when it is not valid, the button is disabled. Once the form values become valid, the disabled property is removed from the DOM element.

Now that you have all the fields on the page, you will want to style that ticket section up a bit so that it looks like tickets.

```css
.ticket {
  text-align: center;
  display: inline-block;
  width: 31%;
  border-radius: 1rem;
  color: #fff;
  padding: 1rem;
  margin: 1rem;
}

.ticket.conf-only,
.ticket.work-only {
  background-color: #333;
}

.ticket.full {
  background-color: #060;
}

.ticket span {
  display: block;
}

.ticket .title {
  font-size: 2rem;
}

.ticket .price {
  font-size: 2.5rem;
}

.ticket .value {
  font-style: italic;
}

.ticket button {
  border-radius: 0.5rem;
  text-align: center;
  font-weight: bold;
  color: #333;
  margin: 1rem;
}
```

These are just three basic ticket types I see regularly for conference registrations.

Now the meat of the registration page, the TypeScript component. You will need a few things to make the page work. You will need a model to store the values that the user enters, a way for the user to _select_ a ticket, and a way for the user to _pay_ for the ticket they have selected.

```ts
import { Component, Inject } from '@angular/core';
import { Http } from '@angular/http';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  public model: any;

  public errorMessage: string = '';
  public successMessage: string = '';

  constructor(private http: Http, @Inject('BASE_URL') private baseUrl: string) {
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
              error => {
                this.errorMessage = 'There was a problem registering you.';
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
```

Even if you're familiar with Angular, some of this may look foreign. For instance, the `BASE_URL` value that is getting injected into the component. It comes from the `main.ts` file that the Angular CLI generated. If you looke at that file, right below the imports, there is a function called `getBaseUrl()` and below that is a `providers` section that provides the value from the `getBaseUrl()` function. This is just a simple way to inject constant values into components.

The other thing that might look strange is the `purchaseTicket()` function. If you've never used Stripe before, the `createToken()` method gets

## Add the ASP.NET Registration Controller

## Add Okta for Registration and Authentication

## Show Your Users Their Tickets
