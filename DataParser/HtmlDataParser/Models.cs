using System.Text.Json.Serialization;

namespace HtmlDataParser;

public class Contract
{
    [JsonPropertyName("cId")]
    public string ContractId { get; set; }
    [JsonPropertyName("desc")]
    public string Desc { get; set; }
    [JsonPropertyName("ctor")]
    public string Contractor { get; set; }
    [JsonPropertyName("dist")]
    public string DistrictOffice { get; set; }
    [JsonPropertyName("src")]
    public string SourceOfFunds { get; set; }

    [JsonPropertyName("cost")]
    public decimal Cost { get; set; }
    [JsonPropertyName("st")]
    public DateTime StartDate { get; set; }
    [JsonPropertyName("end")]
    public DateTime EndDate { get; set; }
    [JsonPropertyName("status")]
    public string Status { get; set; }
    [JsonPropertyName("pct")]
    public float Percent { get; set; }
    [JsonPropertyName("yr")]
    public ushort Year { get; set; }
    [JsonPropertyName("rgn")]
    public string Region { get; set; }

    // For debugging only; do not serialize
    public string HtmlFile;
}