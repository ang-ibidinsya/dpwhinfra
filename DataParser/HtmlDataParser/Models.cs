using System.Text.Json.Serialization;

namespace HtmlDataParser;

public class Contract
{
    [JsonPropertyName("cId")]
    public string ContractId { get; set; }
    [JsonPropertyName("dsc")]
    public string Desc { get; set; }
    [JsonPropertyName("ctr")]
    public List<uint> ContractorIds { get; set; } = new List<uint>();
    public List<string> Contractors = new List<string>();
    [JsonPropertyName("dst")]
    public ushort DistrictOfficeId { get; set; }
    public string DistrictOffice;
    [JsonPropertyName("src")]
    public ushort SourceOfFundsId { get; set; }
    public string SourceOfFunds;

    [JsonPropertyName("p")] // pesos
    public decimal Cost { get; set; }
    [JsonPropertyName("frm")]
    public string StartDateStr { get { return StartDate.HasValue ? StartDate.Value.ToString("yy-MM-dd") : string.Empty; }}
    public DateTime? StartDate;
    [JsonPropertyName("to")]
    public string EndDateStr { get { return EndDate.HasValue ? EndDate.Value.ToString("yy-MM-dd") : string.Empty; }}
    public DateTime? EndDate;
    [JsonPropertyName("sts")]
    public ushort StatusId { get; set; }
    public string Status;
    [JsonPropertyName("pct")]
    public float Percent { get; set; }
    [JsonPropertyName("yr")]
    public ushort Year { get; set; }
    [JsonPropertyName("rgn")]
    public ushort RegionId { get; set; }
    public string Region;

    // For debugging only; do not serialize
    public string HtmlFile;
}