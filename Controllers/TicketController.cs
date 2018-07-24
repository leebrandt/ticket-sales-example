using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace ticket_sales_example.Controllers
{
  [Produces("application/json")]
  [Route("api/[controller]")]
  public class TicketController : Controller
  {
    [HttpGet]
    public async Task<ActionResult<string>> GetAsync()
    {
      return Ok("Ticket Name");
    }
  }
}