namespace PriceRadar.Core.Models
{
	public class Store_Item
	{
		public long Id { get; set; }
		public long StoreId { get; set; }
		public long ProductItemId { get; set; }
		public int AvailableQuantity { get; set; }
		public decimal SellingPrice { get; set; }
		public bool IsDeliveryAvailable { get; set; }
		public bool IsActive { get; set; } = true;
		public bool IsDeleted { get; set; } = false;
		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
	}
}
