namespace ticket_sales_example.Models
{
  public class Registration
  {
    public int RegistrationId { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string EmailAddress { get; set; }
    public string Password { get; set; }
    public Ticket Ticket { get; set; }
    public string Token { get; set; }
    public string UserId { get; set; }
  }
}