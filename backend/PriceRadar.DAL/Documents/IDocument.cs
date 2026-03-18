namespace PriceRadar.DAL.Documents;

public interface IDocument<TModel>
{
    long Id { get; set; }
    TModel ToModel();
}
