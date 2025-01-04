using System;

namespace Categorizer.Models;

// A bit different from HTML Data Parser because the structure there is not deserialize-friendly
public class MasterData
{
public Dictionary<string, ushort> RegionMap = new Dictionary<string, ushort>();
    
    // For Serializing
    public Dictionary<ushort, string> RegionMaster {get; set;}

    public Dictionary<ushort, string> DistrictMaster {get; set;}

    public Dictionary<ushort, string> StatusMaster {get; set;}

    public Dictionary<uint, string> ContractorMaster {get; set;}

    public Dictionary<ushort, string> SourceMaster {get; set;}
}
