using System.Text.Json;
using Categorizer.Models;

namespace Categorizer;

public class ProjectCategorizer
{
    private readonly Dictionary<string, string> manualCategories = new Dictionary<string, string>() {
        {"20O00013", "building"}, //CONSTRUCTION OF 9TH POST ENGINEER DETACHMENT BUILDING WITH MOTORPOOL, FORT ANDRES BONIFACIO, TAGUIG CITY
        {"24N00007", "road"}, //DAANG MAHARLIKA (AGUSAN-DAVAO SECT)- K1254+720- K1255+188, K1255+222- K1257+004, K1260+000- K1261+500
    };
    public void LoadData(string MasterDataFile, string ContractsDataFile)
    {
        if (!File.Exists(MasterDataFile))
        {
            throw new Exception("MasterDataFile does not exist at: " + MasterDataFile);
        }

        if (!File.Exists(ContractsDataFile))
        {
            throw new Exception("ContractsDataFile does not exist at: " + ContractsDataFile);
        }

        string masterDataString = File.ReadAllText(MasterDataFile);
        MasterData masterData = JsonSerializer.Deserialize<MasterData>(masterDataString);

        string contractsString = File.ReadAllText(ContractsDataFile);
        List<Contract> contracts = JsonSerializer.Deserialize<List<Contract>>(contractsString);
        Dictionary<string, int> dictTagDict = new Dictionary<string, int>(); // For debugging only
        foreach(Contract contract in contracts)
        {
            MapContractMasterData(masterData, contract);
            CategorizeContract(contract, dictTagDict);
        }

        // Log statistics
        int countWithLabel = contracts.Count(c => c.Tags.Count > 0);
        Console.WriteLine($"{countWithLabel} / {contracts.Count} has been categorized ({countWithLabel*100.0/contracts.Count:0.00}%)");
        foreach(var kvp in dictTagDict)
        {
            Console.WriteLine($"[{kvp.Key}]\t\t\t-- {kvp.Value}");
        }

        // Debug
        #if false
        Console.WriteLine("Purpose not tagged");
        var purposeNotTagged = contracts.Where(c => !c.Tags.Contains("multi") && c.Desc.ToLowerInvariant().Contains("purpose"));
        int i = 0;
        foreach(var x in purposeNotTagged)
        {
            Console.WriteLine($"[{i++}][{string.Join("/", x.Tags)}]{x.Desc}");
        }

        Console.WriteLine("--- Drainages---");
        var found = contracts.Where(c => c.Tags.Contains("drainage"));
        int i = 0;
        foreach(var x in found)
        {
            Console.WriteLine($"[{i++}][{string.Join("/", x.Tags)}]{x.Desc}");
        }

        Console.WriteLine("--- Drain---"); // will catch those wrong spellings of drainage
        var found = contracts.Where(c => c.Tags.Contains("drain"));
        int i = 0;
        foreach(var x in found)
        {
            Console.WriteLine($"[{i++}][{string.Join("/", x.Tags)}]{x.Desc}");
        }
        #endif
        // new ExcelUtil().GenerateExcel(contracts);
    }

    private void MapContractMasterData(MasterData masterData, Contract contract)
    {
        foreach(uint contractId in contract.ContractorIds)
        {
            contract.Contractors.Add(masterData.ContractorMaster[contractId]);
        }
        contract.Status = masterData.StatusMaster[contract.StatusId];
        contract.DistrictOffice = masterData.DistrictMaster[contract.DistrictOfficeId];
        contract.Region = masterData.RegionMaster[contract.RegionId];
        contract.SourceOfFunds = masterData.SourceMaster[contract.SourceOfFundsId];
    }

    private void IncrementDict(Dictionary<string, int> dictTagDict, string key)
    {
        if (!dictTagDict.ContainsKey(key))
        {
            dictTagDict[key] = 0;
        }
        dictTagDict[key]++;
    }

    private void CategorizeContract(Contract contract, Dictionary<string, int> dictTagDict)
    {
        // [0] Manual Overrides
        if (manualCategories.ContainsKey(contract.ContractId))
        {
            string cat = manualCategories[contract.ContractId];
            contract.Tags.Add(cat);
            IncrementDict(dictTagDict, cat);
            return;
        }

        // [A] By District
        if (contract.DistrictOffice == "Central Office - Flood Control Management Cluster")
        {
            contract.Tags.Add("flood");
            IncrementDict(dictTagDict, "flood");
            return;
        }

        if (contract.DistrictOffice == "Central Office - Bridges Management Cluster")
        {
            contract.Tags.Add("bridge");
            IncrementDict(dictTagDict, "bridge");
            return;
        }

        if (contract.DistrictOffice == "Central Office - Roads Management Cluster I (Bilateral)" ||
           contract.DistrictOffice == "Central Office - Roads Management Cluster II (Multilateral)")
        {
            contract.Tags.Add("road");
            IncrementDict(dictTagDict, "road");
            return;
        }

        if (contract.DistrictOffice == "Central Office - Buildings and Special Projects Management Cluster")
        {
            contract.Tags.Add("building");
            IncrementDict(dictTagDict, "building");
            return;
        }

        // [B] parse description
        // Start from most confident to least confident
        string descToLower = contract.Desc.ToLowerInvariant();
        if (descToLower.Contains("flood") || descToLower.Contains("dred") || descToLower.Contains("storm")
           || descToLower.Contains("booster pump") || descToLower.Contains("pumping sta")
           || descToLower.Contains("riverbank pro") || descToLower.Contains("revetment")
           || descToLower.Contains("river prot")
           || descToLower.Contains("river control") || descToLower.Contains("embankment")
           || descToLower.Contains("bank protection") || descToLower.Contains("wall prot")
           || descToLower.Contains("lakewall") || descToLower.Contains("lake wall")
           || descToLower.Contains("seawall") || descToLower.Contains("sea wall")
           || descToLower.Contains("guardwall") || descToLower.Contains("guard wall")
           || descToLower.Contains("water impounding") || descToLower.Contains("culvert") 
           || descToLower.Contains("groin") || descToLower.Contains("shore prot") 
           || descToLower.Contains("shoreline prot") 
           )
        {
            contract.Tags.Add("flood");
            IncrementDict(dictTagDict, "flood");
            return;
        }

        if (descToLower.Contains("hospital") || descToLower.Contains("office building") || descToLower.Contains("office bldg")
            || descToLower.Contains("kidney") || descToLower.Contains("cancer") || descToLower.Contains("office bldg"))
        {
            contract.Tags.Add("building");
            IncrementDict(dictTagDict, "building");
            return;
        }

        if (descToLower.Contains("footbridge") || descToLower.Contains("foot bridge"))
        {
            contract.Tags.Add("footbridge");
            IncrementDict(dictTagDict, "footbridge");
            return;
        }

        if (descToLower.Contains("light") && !descToLower.Contains("lighthouse"))
        {
            contract.Tags.Add("light");
            IncrementDict(dictTagDict, "light");
            return;
        }

        /* Too many more wrong spellings, just use purpose
        if (descToLower.Contains("multi-purpose") || descToLower.Contains("multipurpose") 
           || descToLower.Contains("multi - purpose") || descToLower.Contains("multi purpose")
           || descToLower.Contains("multi- purpose") || descToLower.Contains("m-purpose")
           || descToLower.Contains("muli-purpose") || descToLower.Contains("muti-purpose") 
           || descToLower.Contains("mult- purpose") || descToLower.Contains("multi  - purpose")
           || descToLower.Contains("mylti-purpose") || descToLower.Contains("mulri-purpose")
           || descToLower.Contains("multi-purpose") || descToLower.Contains("mulri-purpose")
           )
        {
            contract.Tags.Add("multi");
            IncrementDict(dictTagDict, "multi");
            return;
        }
        */

        if (descToLower.Contains("storey")) // Should come after purpose because there are multi-storey multi-purpose buildings too
        {
            contract.Tags.Add("building");
            IncrementDict(dictTagDict, "building");
            return;
        }

        if (descToLower.Contains("davao") && descToLower.Contains("bypass"))
        {
            contract.Tags.Add("davao bypass");
            IncrementDict(dictTagDict, "davao bypass");
            return;
        }

        if (descToLower.Contains("waiting") || descToLower.Contains("covered walk"))
        {
            contract.Tags.Add("waiting");
            IncrementDict(dictTagDict, "waiting");
            return;
        }

        if (descToLower.Contains("road wid") || descToLower.Contains("missing link") || descToLower.Contains("new road"))
        {
            contract.Tags.Add("road");
            IncrementDict(dictTagDict, "road");
            return;
        }

        if (descToLower.Contains("widen") || descToLower.Contains("national road system"))
        {
            if (descToLower.Contains("bridge") || descToLower.Contains("birdge"))
            {
                contract.Tags.Add("bridge");
                IncrementDict(dictTagDict, "bridge");
                return;
            }
            // assume road
            contract.Tags.Add("road");
            IncrementDict(dictTagDict, "road");
            return;        
        }

        if (descToLower.Contains("roads") && descToLower.Contains("bridges"))
        {
            contract.Tags.Add("road+bridge");
            IncrementDict(dictTagDict, "road+bridge");
            return;
        }

        if (descToLower.Contains("national roads") || descToLower.StartsWith("construction of road,")
           || descToLower.StartsWith("construction of concrete road")
           || descToLower.StartsWith("construction of gravel road")           
           || descToLower.Contains("concreting of road")
           || descToLower.Contains("construction of jct"))
        {
            contract.Tags.Add("road");
            IncrementDict(dictTagDict, "road");
            return;
        }

        if (descToLower.Contains("lanes"))
        {
            contract.Tags.Add("lanes");
            IncrementDict(dictTagDict, "lanes");
            return;
        }

        if (descToLower.Contains("access road") || descToLower.Contains("access rd"))
        {
            contract.Tags.Add("access road");
            IncrementDict(dictTagDict, "access road");
            return;
        }

        if (descToLower.Contains("coastal roads"))
        {
            contract.Tags.Add("coastal roads");
            IncrementDict(dictTagDict, "coastal roads");
            return;
        }

        if (descToLower.Contains("construction of road,"))
        {
            contract.Tags.Add("road");
            IncrementDict(dictTagDict, "road");
            return;
        }

        if (descToLower.Contains("by-pass road") || descToLower.Contains("bypass road") || descToLower.Contains("diversion roads")
           || descToLower.Contains("circumfer") || descToLower.Contains("alternate road")|| descToLower.Contains("diversion rd")
           || descToLower.Contains("secondary road") || descToLower.Contains("missing gaps") || descToLower.Contains("with slip") 
           || descToLower.Contains("asphalt ov") || descToLower.Contains("reconstruction to concrete pave")
           || descToLower.Contains("pavement marking") || descToLower.Contains("carriageway") || descToLower.Contains("carriage way")
           || descToLower.Contains("tertiary road") || descToLower.Contains("road concreting")
           || descToLower.Contains("road upgrad") || descToLower.Contains("rd concreting")
           || descToLower.Contains("including right of way") || descToLower.Contains("including right-of-way")
           || descToLower.Contains("including rrow") || descToLower.Contains("including row")
           || descToLower.Contains("road safety device") || descToLower.Contains("road opening")
           || descToLower.Contains("construction of road") || descToLower.Contains("road stud")
           )
        {
            if (descToLower.Contains("bridge"))
            {
                contract.Tags.Add("roads+bridges");
                IncrementDict(dictTagDict, "roads+bridges");
                return;
            }
            contract.Tags.Add("road");
            IncrementDict(dictTagDict, "road");
            return;
        }

        // Flyover has lower precedence because there are roads/bridges that mention along XXX flyover
        if (descToLower.Contains("flyover") || descToLower.Contains("fly over") 
        || descToLower.Contains("fly-over") || descToLower.Contains("fly- over")
        || descToLower.Contains("fly - over") || descToLower.Contains("fly over")
        )
        {
            if (descToLower.Contains("bridges"))
            {
                contract.Tags.Add("roads+bridges");
                IncrementDict(dictTagDict, "roads+bridges");
                return;
            }
            contract.Tags.Add("road");
            IncrementDict(dictTagDict, "road");
            return;
        }

        if (descToLower.Contains("roads with slips") || descToLower.Contains("roads w/ slips") 
           || descToLower.Contains("damaged pave")
           || descToLower.Contains("paved road") || descToLower.Contains("unpaved to pave")
           || descToLower.Contains("preventive maintenance - primary roads")
           || descToLower.Contains("preventive maintenance-primary roads")
           || descToLower.Contains("improvement of intersection")
           || descToLower.Contains("improvement of roads")
           || descToLower.Contains("special road fund")
           )
        {
            contract.Tags.Add("road");
            IncrementDict(dictTagDict, "road");
            return;
        }

        if (descToLower.Contains("bridge construction") || descToLower.Contains("weak bridge")
           || descToLower.Contains("permanent birdges") || descToLower.Contains("permanent bridges")
           || descToLower.Contains("national bridge const") || descToLower.Contains("bridge program") 
           || descToLower.StartsWith("construction of concrete bridge") || descToLower.StartsWith("tulay ng pangulo")
           || descToLower.StartsWith("repair of bridge") || descToLower.StartsWith("repair of permanent bridge")
           || descToLower.StartsWith("maintenance of bridge") || descToLower.StartsWith("construction of bridge")
           || descToLower.StartsWith("construction of permanent bridge") || descToLower.StartsWith("const. of bridge")
           )
        {
            contract.Tags.Add("bridge");
            IncrementDict(dictTagDict, "bridge");
            return;
        }

        // lower priority for "various"
        if (descToLower.Contains("various roads") || descToLower.Contains("various road proj")
        || descToLower.Contains("various road building"))
        {
            contract.Tags.Add("various road");
            IncrementDict(dictTagDict, "various road");
            return;
        }

        // lower precedence because sometimes these are just addons to roads and bridges
        if (descToLower.Contains("drainage") || descToLower.Contains("drain") || descToLower.Contains("slope protection"))
        {
            contract.Tags.Add("flood");
            IncrementDict(dictTagDict, "flood");
            return;
        }

        if (descToLower.Contains("mitigation"))
        {
            contract.Tags.Add("mitigation");
            IncrementDict(dictTagDict, "mitigation");
            return;
        }

        if (descToLower.Contains("overpass") || descToLower.Contains("over-pass"))
        {
            contract.Tags.Add("overpass");
            IncrementDict(dictTagDict, "overpass");
            return;
        }

        if (descToLower.Contains("underpass") || descToLower.Contains("under-pass"))
        {
            contract.Tags.Add("underpass");
            IncrementDict(dictTagDict, "underpass");
            return;
        }

        // Should be lower precedence because it can be a MPB with medical center or East Ave Medical Center
        if (descToLower.Contains("medical center"))
        {
            contract.Tags.Add("building");
            IncrementDict(dictTagDict, "building");
            return;
        }

        if (descToLower.Contains("police") || descToLower.Contains("military") || descToLower.Contains("camp aguinaldo") 
        || descToLower.Contains("camp emilio aguinaldo") || descToLower.Contains("pnp") || descToLower.Contains("camp crame") 
        || descToLower.Contains("camp bagong") || descToLower.Contains("ncrpo"))
        {            
            contract.Tags.Add("police+military");
            IncrementDict(dictTagDict, "police+military");
            return;
        }

        if (descToLower.Contains("up diliman") || descToLower.Contains("polytechnic") 
           || descToLower.Contains("school") || descToLower.Contains("academy") || descToLower.Contains("college"))
        {            
            contract.Tags.Add("school");
            IncrementDict(dictTagDict, "school");
            return;
        }

        // Lower priority for airbase because it has elementary schools, drainage and road projects too
        if (descToLower.Contains("air base") || descToLower.Contains("airbase") 
           || descToLower.Contains("philippine army") || descToLower.Contains("philippine navy")
        )
        {            
            contract.Tags.Add("police+military");
            IncrementDict(dictTagDict, "police+military");
            return;
        }

        if (descToLower.Contains("water supply")
        )
        {            
            contract.Tags.Add("water supply");
            IncrementDict(dictTagDict, "water supply");
            return;
        }

        // There can be MPB from schools and other govt agencies.
        // Exclude these as much as possible
        if (descToLower.Contains("purpose") || descToLower.Contains("evacuation") || descToLower.Contains("mpb") 
        || descToLower.Contains("convention") || descToLower.Contains("sports") || descToLower.Contains("skate")
        || descToLower.Contains("covered court") || descToLower.Contains("baseball") || descToLower.Contains("basketball")
        || descToLower.Contains("boxing")
        )
        {
            contract.Tags.Add("multi");
            IncrementDict(dictTagDict, "multi");
            return;
        }
    }


    // public void ManualCategorization(List<Contract> allContracts, Dictionary<string, int> dictTagDict)
    // {
    //     foreach(var kvpOverrides in manualCategories)
    //     {
    //         C
    //     }
    // }
}
