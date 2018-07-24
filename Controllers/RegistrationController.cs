using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Okta.Sdk;
using Stripe;
using ticket_sales_example.Models;

namespace ticket_sales_example.Controllers
{
  [Produces("application/json")]
  [Route("api/[controller]")]
  public class RegistrationController : ControllerBase
  {
    [HttpPost]
    public async Task<ActionResult<Registration>> CreateAsync([FromBody] Registration registration)
    {
      ChargeCard(registration);
      var oktaUser = await RegisterUserAsync(registration);
      registration.UserId = oktaUser.Id;
      return Ok(registration);
    }

    private async Task<User> RegisterUserAsync(Registration registration)
    {
      var client = new OktaClient();
      var user = await client.Users.CreateUserAsync(
        new CreateUserWithPasswordOptions
        {
          Profile = new UserProfile
          {
            FirstName = registration.FirstName,
            LastName = registration.LastName,
            Email = registration.EmailAddress,
            Login = registration.EmailAddress,
          },
          Password = registration.Password,
          Activate = true
        }
      );

      var groupName = "";
      if (registration.Ticket.TicketType == "Full Conference + Workshop")
      {
        groupName = "FullAttendees";
      }
      if (registration.Ticket.TicketType == "Conference Only")
      {
        groupName = "ConferenceOnlyAttendees";
      }
      if (registration.Ticket.TicketType == "Workshop Only")
      {
        groupName = "WorkshopOnlyAttendees";
      }

      var group = await client.Groups.FirstOrDefault(g => g.Profile.Name == groupName);
      if (group != null && user != null)
      {
        await client.Groups.AddUserToGroupAsync(group.Id, user.Id);
      }



      return user as User;
    }

    private StripeCharge ChargeCard(Registration registration)
    {
      StripeConfiguration.SetApiKey("sk_test_uukFqjqsYGxoHaRTOS6R7nFI");

      var options = new StripeChargeCreateOptions
      {
        Amount = registration.Ticket.Price,
        Currency = "usd",
        Description = registration.Ticket.TicketType,
        SourceTokenOrExistingSourceId = registration.Token,
        StatementDescriptor = "SuperDuperConf Ticket"
      };

      var service = new StripeChargeService();
      return service.Create(options);
    }
  }
}