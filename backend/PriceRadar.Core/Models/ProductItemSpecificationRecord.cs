namespace PriceRadar.Core.Models;

public class ProductItemSpecificationRecord
{
    public long Id { get; set; }
    public long ProductItemId { get; set; }
    public ProductItemSpecification Specifications { get; set; } = new();
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
