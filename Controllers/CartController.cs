using Microsoft.AspNetCore.Mvc;
using MobileAppServer.Abstracts;
using MobileAppServer.Mappers;
using MobileAppServer.Models.Cart;

namespace MobileAppServer.Controllers
{
    [ApiController]
    [Route("api/cart")]
    public class CartController : ControllerBase
    {
        private readonly ICartRepository _cartRepository;
        public CartController(ICartRepository cartRepository)
        {
            _cartRepository = cartRepository;
        }

        [HttpGet("{userId:long}")]
        public async Task<ActionResult<CartDTO>> GetCart(long userId)
        {
            var cart = await _cartRepository.GetCartByUserAsync(userId);
            return Ok(cart.ToDto());
        }

        [HttpPost("{userId:long}/items")]
        public async Task<ActionResult<CartItemDTO>> AddItem(long userId, [FromBody] AddToCartDTO dto)
        {
            if (dto == null || dto.Quantity <= 0)
            {
                return BadRequest("Некорректные данные для добавления в корзину");
            }

            try
            {
                var item = await _cartRepository.AddToCartAsync(userId, dto.ServiceId, dto.Quantity);
                return Ok(item.ToDto());
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPut("{userId:long}/items/{cartItemId:long}")]
        public async Task<ActionResult> UpdateItem(long userId, long cartItemId, [FromBody] UpdateCartItemDTO dto)
        {
            if (dto == null)
            {
                return BadRequest("Данные не могут быть пустыми");
            }

            var ok = await _cartRepository.UpdateCartItemAsync(userId, cartItemId, dto.Quantity);
            return ok ? NoContent() : NotFound();
        }

        [HttpDelete("{userId:long}/items/{cartItemId:long}")]
        public async Task<ActionResult> RemoveItem(long userId, long cartItemId)
        {
            var ok = await _cartRepository.RemoveFromCartAsync(userId, cartItemId);
            return ok ? NoContent() : NotFound();
        }

        [HttpDelete("{userId:long}")]
        public async Task<ActionResult> Clear(long userId)
        {
            await _cartRepository.ClearCartAsync(userId);
            return NoContent();
        }

        [HttpGet("{userId:long}/count")]
        public async Task<ActionResult<int>> GetCount(long userId)
        {
            var count = await _cartRepository.GetCartItemsCountAsync(userId);
            return Ok(count);
        }

        [HttpGet("{userId:long}/total")]
        public async Task<ActionResult<decimal>> GetTotal(long userId)
        {
            var total = await _cartRepository.GetCartTotalAsync(userId);
            return Ok(total);
        }
    }
}
