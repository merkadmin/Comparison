namespace PriceRadar.DAL.Documents;

public interface IDocument<TModel>
{
    long Id       { get; set; }
    bool IsActive  { get; set; }
    bool IsDeleted { get; set; }
    TModel ToModel();
}
