namespace HtmlDataParser;

public class MasterData
{
    public Dictionary<string, ushort> RegionMap = new Dictionary<string, ushort>();
    public Dictionary<string, ushort> DistrictMap = new Dictionary<string, ushort>();
    public Dictionary<string, ushort> StatusMap = new Dictionary<string, ushort>() {
        // Initialize known statuses to maintain this order until front end
        {"Completed", 0},
        {"On-Going", 1},
        {"Not Yet Started", 2},
        {"Terminated", 3}
    };

    public Dictionary<string, uint> ContractorMap = new Dictionary<string, uint>();
    public Dictionary<string, ushort> SourceMap = new Dictionary<string, ushort>();

    // For Serializing
    public Dictionary<ushort, string> RegionMaster {get {
        return RegionMap.ToDictionary(x => x.Value, x=> x.Key);

        // TODO: Sort values alphabetically so that front end would not have to sort the values
    }}

    public Dictionary<ushort, string> DistrictMaster {get {
        return DistrictMap.ToDictionary(x => x.Value, x=> x.Key);
    }}

    public Dictionary<ushort, string> StatusMaster {get {
        return StatusMap.ToDictionary(x => x.Value, x=> x.Key);
    }}

    public Dictionary<uint, string> ContractorMaster {get {
        return ContractorMap.ToDictionary(x => x.Value, x=> x.Key);
    }}

    public Dictionary<ushort, string> SourceMaster {get {
        return SourceMap.ToDictionary(x => x.Value, x=> x.Key);
    }}

}