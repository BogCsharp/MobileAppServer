using MobileAppServer.Entities;
using MobileAppServer.Models.Cart;

namespace MobileAppServer.Mappers
{
	public static class CartMapper
	{
		public static CartDTO ToDto(this CartEntity cartEntity)
		{
			var items = cartEntity.CartItems?.Select(ci => ci.ToDto()).ToList() ?? new List<CartItemDTO>();
			return new CartDTO
			{
				CartId = cartEntity.Id,
				UserId = cartEntity.UserId,
				Items = items,
				TotalItems = items.Sum(i => i.Quantity),
				TotalAmount = items.Sum(i => i.Total)
			};
		}

		public static CartItemDTO ToDto(this CartItemEntity cartItemEntity)
		{
			return new CartItemDTO
			{
				Id = cartItemEntity.Id,
				Name = cartItemEntity.Name,
				ServiceId = cartItemEntity.ServiceId,
				Price = cartItemEntity.Price,
				Quantity = cartItemEntity.Quantity
			};
		}

		public static CartItemEntity ToEntity(this AddToCartDTO addToCartDto, long cartId, ServiceEntity service)
		{
			return new CartItemEntity
			{
				CartId = cartId,
				ServiceId = addToCartDto.ServiceId,
				Name = service.Name,
				Price = service.Price,
				Quantity = addToCartDto.Quantity
			};
		}

		public static CartItemEntity ApplyUpdate(this CartItemEntity cartItemEntity, UpdateCartItemDTO updateDto)
		{
			cartItemEntity.Quantity = updateDto.Quantity;
			return cartItemEntity;
		}
	}
}
