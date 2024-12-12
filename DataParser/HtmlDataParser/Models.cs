namespace HtmlDataParser;

public class Contract
{
    public string ContractId { get; set; }
    public string Desc { get; set; }
    public string Contractor { get; set; }
    public string DistrictOffice { get; set; }
    public string SourceOfFunds { get; set; }

    public decimal Cost { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; }
    public float Percent { get; set; }

    public ushort Year { get; set; }
    public string Region { get; set; }

    // For debugging only
    public string HtmlFile { get; set; }
}