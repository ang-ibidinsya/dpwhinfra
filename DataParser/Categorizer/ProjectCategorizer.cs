using System.Text.Json;
using System.Text.RegularExpressions;
using Categorizer.Models;

namespace Categorizer;

public class ProjectCategorizer
{
    private readonly Dictionary<string, string> manualCategories = new Dictionary<string, string>() {
        {"20O00013", "building"}, //CONSTRUCTION OF 9TH POST ENGINEER DETACHMENT BUILDING WITH MOTORPOOL, FORT ANDRES BONIFACIO, TAGUIG CITY
        {"24N00007", "road"}, //DAANG MAHARLIKA (AGUSAN-DAVAO SECT)- K1254+720- K1255+188, K1255+222- K1257+004, K1260+000- K1261+500
        {"20OD0220", "school"}, //CONSTRUCTION OF NEW VALPOLY CAMPUS, BRGY. PARADA, VALENZUELA CITY
        {"20O00040", "building"}, //CONSTRUCTION OF TAGUIG CITY PAROLA, BRGY. NAPINDAN, TAGUIG CITY
        {"17L00007", "road"}, //IMPVT./UPGRADING (GRAVEL TO CONCRETE) OF ISLAND GARDEN CITY OF SAMAL (IGACOS) CIRC. RD (EAST SIDE) D
        {"19Z00015", "bridge"}, //PR-09A, GUICAM BRIDGE, ZAMBOANGA SIBUGAY UNDER ADB LOAN NO. 3631-PHI: IMPROVING GROWTH CORRIDORS IN MINDANAO ROAD SECTOR PROJECT (IGCMRSP)
        {"18Z00005", "road"}, //CENTRAL LUZON LINK EXPRESSWAY (CLLEX) PROJECT, PHASE 1 PACKAGE 5 - ZARAGOZA INTERCHANGE SECTION
        {"22O00030", "building"}, //CONSTRUCTION OF NATIONAL HEADQUARTERS OF THE COOPERATIVE DEVELOPMENT AUTHORITY (CDA), 827 AURORA BLVD., CUBAO, QUEZON CITY
        {"19L00197", "building"}, //CONSTRUCTION OF AGDAO FARMERS MARKET PHASE 2, AGDAO, DAVAO CITY
        {"21N00047", "bridge"}, //HUBO BR. (B01834MN) ALONG SURIGAO- DAVAO COASTAL RD, SAN AGUSTIN, SURIGAO DEL SUR
        {"23N00131", "bridge"}, //KINALABLABAN BR. (B00306MN) ALONG SURIGAO-DAVAO COASTAL RD
        {"22N00024", "road+bridge"}, //BUTUAN CITY WEST DIVERSION ROAD (PINAMANCULAN BRIDGE), PACKAGE 1, BUTUAN CITY, AGUSAN DEL NORTE
        {"18G00043", "road+bridge"}, //BACOLOD NEGROS OCCIDENTAL ECONOMIC HIGHWAY (BANOCEH), SECTION 1, PACKAGE A, INCL. BRIDGE AND ROW, NEGROS OCCIDENTAL
        {"23N00020", "bridge"}, //
        {"17OH0101", "building"}, //PROPOSED ASPHALT OVERLAY AT COCONUT PALACE COMPOUND,CCP COMPLEX,PASAY CITY
        {"20K00356", "building"}, //CLUSTER RO-02 CONSTRUCTION OF BUILDING PROJECTS IN BUKIDNON, 1. CONSTRUCTION OF TRACK AND FIELD AND TRACK OVAL, BRGY. LAGUITAS, MALAYBALAY CITY, BUKIDNON = PHP30,000,000.00, 2. CONSTRUCTION OF PERIMETER FENCE (WITH FENCE LIGHTS), BRGY. LAGUITAS ...
        {"22AB0101", "light"}, //INSTALLATION OF STREET LIGHTS ALONG SEAWALL BOULEVARD, CURRIMAO, ILOCOS NORTE
        {"23JI0059", "light"}, // CONSTRUCTION OF SOLAR STREET LIGHT LANAO-PAGADIAN-ZAMBOANGA CITY NATIONAL ROAD STA. 1724+-595 - STA. 1756+236
        {"21DG0066", "light"}, // 
        {"23KD0024", "light"}, //INST. OF STREET LIGHTS ALONG MACASANDIG-BALULANG BRIDGE(SITIO TIBASAK, MACASANDIG TO BRGY BALULANG)
        {"23AI0115", "light"}, // REHABILITATION OF SOLAR LED STREET LIGHTS IN BINALONAN, PANGASINAN
        {"19OB0167", "road"}, // REHABILITATION/IMPROVEMENT OF ROADS, DRAINAGE SYSTEM AND FOOT BRIDGE AT MASTRIL1, M. GREGORIO ST., F. MANALO ST. AND ISAIAS BUNYI, BRGY. CALZADA AND DULONG BAYAN ST., BAMBANG TAGUIG CITY
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

            OverrideCategoryManually(contract, dictTagDict);
            CategorizeViaDistrict(contract, dictTagDict);
            CategorizeViaWordSearch(contract, dictTagDict);
            CategorizeViaNounAndVerb(contract, dictTagDict);
            CategorizeLeadingTo(contract, dictTagDict);
            CategorizeSingleKeywordProjects(contract, dictTagDict);
            CategorizeLowestPrecedence(contract, dictTagDict);
            if (!contract.Tags.Any())
            {
                contract.Tags.Add("uncategorized");
                IncrementDict(dictTagDict, "uncategorized");
            }
        }

        // Log statistics
        int countWithLabel = contracts.Count(c => !c.Tags.Contains("uncategorized"));
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
        new ExcelUtil().GenerateExcel(contracts);

        // Write categories into master data
        Dictionary<string, ushort> categoryMap = WriteMasterData(dictTagDict, masterData);
        foreach(Contract contract in contracts)
        {
            if (!contract.Tags.Any()) {
                continue;
            }
            contract.CategoryId = categoryMap[contract.Tags.FirstOrDefault()];
        }
        // To avoid unnecessarily escaping ampersand and + in JSON
        var options = new JsonSerializerOptions
        {
            Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
        };
        File.WriteAllText("AllContractsCategorized.json", JsonSerializer.Serialize(contracts, options));
        File.WriteAllText("MasterDataCategorized.json", JsonSerializer.Serialize(masterData, options));
        Console.WriteLine($"[{DateTime.Now:HH:mm:ss.fff}] Finished Writing!");
    }

    private Dictionary<string, ushort> WriteMasterData( Dictionary<string, int> dictTagDict, MasterData masterData)
    {
        Dictionary<string, ushort> retMap = new Dictionary<string, ushort>();
        var categories = dictTagDict.Keys;
        ushort idx = 0;
        foreach(string cat in categories)
        {
            retMap[cat] = idx++;
        }

        masterData.CategoryInternal = retMap;
        return retMap;
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

    private void OverrideCategoryManually(Contract contract, Dictionary<string, int> dictTagDict)
    {
        if (manualCategories.ContainsKey(contract.ContractId))
        {
            string cat = manualCategories[contract.ContractId];
            contract.Tags.Add(cat);
            IncrementDict(dictTagDict, cat);
            return;
        }
    }

    private void OverrideViaDistrictOffice(Contract contract, Dictionary<string, int> dictTagDict)
    {
        if (contract.Tags.Any())
        {
            return;
        }

        if (manualCategories.ContainsKey(contract.ContractId))
        {
            string cat = manualCategories[contract.ContractId];
            contract.Tags.Add(cat);
            IncrementDict(dictTagDict, cat);
            return;
        }
    }

    private void CategorizeViaDistrict(Contract contract, Dictionary<string, int> dictTagDict)
    { 
        if (contract.Tags.Any())
        {
            return;
        }

        string descToLower = contract.Desc.ToLower();
        // Exclude Davao Bypass
        if (descToLower.Contains("davao") && 
            (descToLower.Contains("bypass") || descToLower.Contains("by-pass")))
        {
            return;
        }

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

#if false // Remove because some are bridges (e.g. Panguil Bay Bridge)
        if (contract.DistrictOffice == "Central Office - Roads Management Cluster I (Bilateral)" ||
           contract.DistrictOffice == "Central Office - Roads Management Cluster II (Multilateral)")
        {
            contract.Tags.Add("road");
            IncrementDict(dictTagDict, "road");
            return;
        }
#endif
        if (contract.DistrictOffice == "Central Office - Buildings and Special Projects Management Cluster")
        {
            contract.Tags.Add("building");
            IncrementDict(dictTagDict, "building");
            return;
        }
    }

    private void CategorizeViaWordSearch(Contract contract, Dictionary<string, int> dictTagDict)
    {     
        if (contract.Tags.Any())
        {
            return;
        }   
        
        // Start from most confident to least confident
        string descToLower = contract.Desc.ToLowerInvariant();
        if (descToLower.Contains("flood") || descToLower.Contains("dred") || descToLower.Contains("storm")
           || descToLower.Contains("booster pump") || descToLower.Contains("pumping sta")
           || descToLower.Contains("riverbank pro") || descToLower.Contains("revetment")
           || descToLower.Contains("river prot")|| descToLower.Contains("desiltation")
           || descToLower.Contains("river control") || descToLower.Contains("embankment")
           || descToLower.Contains("bank protection") || descToLower.Contains("wall prot")
           || descToLower.Contains("lakewall") || descToLower.Contains("lake wall")
           || descToLower.Contains("seawall") || descToLower.Contains("sea wall")
           || descToLower.Contains("guardwall") || descToLower.Contains("guard wall")
           || descToLower.Contains("riverwall") || descToLower.Contains("river wall")
           || descToLower.Contains("water impounding") || descToLower.Contains("culvert") 
           || descToLower.Contains("groin") || descToLower.Contains("shore prot") 
           || descToLower.Contains("shoreline prot") || descToLower.Contains("gabion") 
           || descToLower.Contains("mattress") || descToLower.Contains("bank improvement") 
           || descToLower.Contains("breakwater") || descToLower.Contains("break water") 
           || descToLower.Contains("retarding basin") || descToLower.Contains("retention basin")
           )
        {
            contract.Tags.Add("flood");
            IncrementDict(dictTagDict, "flood");
            return;
        }

        if (descToLower.Contains("hospital") || descToLower.Contains("office building") || descToLower.Contains("office bldg")
            || descToLower.Contains("kidney") || descToLower.Contains("cancer") || descToLower.Contains("office bldg") || descToLower.Contains("health center") )
        {
            contract.Tags.Add("building");
            IncrementDict(dictTagDict, "building");
            return;
        }
        
        if (descToLower.Contains("footbridge") || descToLower.Contains("foot bridge"))
        {
            bool bSkipFb = false;
            // skip if it contains other "bridge"
            int indexFb = descToLower.IndexOf("footbridge");
            int lenFb = "footbridge".Length;
            if (indexFb < 0)
            {
                indexFb = descToLower.IndexOf("foot bridge");
                lenFb = "foot bridge".Length;
            }
            if (indexFb < 0)
            {
                throw new Exception("Unexpected Index for footbridge");
            }
            int indexBridgeBefore = descToLower.Substring(0, indexFb).IndexOf("bridge");
            int indexBridgeAfter = descToLower.Substring(indexFb + lenFb).IndexOf("bridge");
            if (indexBridgeBefore < 0 && indexBridgeAfter < 0)
            {
                contract.Tags.Add("footbridge");
                IncrementDict(dictTagDict, "footbridge");
                return;
            }            
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

        if (descToLower.Contains("road wid") || descToLower.Contains("missing link") || descToLower.Contains("new road"))
        {
            contract.Tags.Add("road");
            IncrementDict(dictTagDict, "road");
            return;
        }

        if (descToLower.Contains("widen"))
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

        if ( (descToLower.Contains("install") && (descToLower.Contains("light") || descToLower.Contains("studs") || descToLower.Contains("studflush"))) 
            || descToLower.Contains("lighting")
            || descToLower.Contains("construction of solar street light")
        )
        {
            if (!descToLower.Contains("lighthouse"))
            {
                contract.Tags.Add("light");
                IncrementDict(dictTagDict, "light");
                return;
            }
        }


        if (descToLower.Contains("roads") && descToLower.Contains("bridges"))
        {
            contract.Tags.Add("road+bridge");
            IncrementDict(dictTagDict, "road+bridge");
            return;
        }

        if (descToLower.Contains("national roads"))
        {
            contract.Tags.Add("road");
            IncrementDict(dictTagDict, "road");
            return;
        }

        if (descToLower.Contains("lanes"))
        {
            contract.Tags.Add("road");
            IncrementDict(dictTagDict, "road");
            return;
        }

        if (descToLower.Contains("access road") || descToLower.Contains("access rd"))
        {
            contract.Tags.Add("road");
            IncrementDict(dictTagDict, "road");
            return;
        }

        if (descToLower.Contains("coastal roads"))
        {
            contract.Tags.Add("road");
            IncrementDict(dictTagDict, "road");
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
           || descToLower.Contains("road upgrad") || descToLower.Contains("rd concreting") || descToLower.Contains("rd upgrdng")
           || descToLower.Contains("including right of way") || descToLower.Contains("including right-of-way")
           || descToLower.Contains("including rrow") || descToLower.Contains("including row")
           || descToLower.Contains("incl. rrow") || descToLower.Contains("incl. row")
           || descToLower.Contains("road safety device") || descToLower.Contains("road opening")
           || descToLower.Contains("construction of road") || descToLower.Contains("road stud")
           || descToLower.Contains("improvement of road") || descToLower.Contains("const. of rd") || descToLower.Contains("const. of causeway")
           || descToLower.Contains("construction of concrete road")
           || descToLower.Contains("construction of gravel road")
           || descToLower.Contains("construction of local road")
           || descToLower.Contains("concreting of local road")
           || descToLower.Contains("concreting of road")
           || descToLower.Contains("rockfall") || descToLower.Contains("lateral road")
           || descToLower.Contains("construction of jct")
           || descToLower.Contains("alternate route")
           )
        {
            if (descToLower.Contains("bridge"))
            {
                contract.Tags.Add("road+bridge");
                IncrementDict(dictTagDict, "road+bridge");
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
                contract.Tags.Add("road+bridge");
                IncrementDict(dictTagDict, "road+bridge");
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
           || descToLower.StartsWith("bridge")
           || descToLower.StartsWith("repair of bridge") || descToLower.StartsWith("repair of permanent bridge")
           || descToLower.StartsWith("maintenance of bridge") || descToLower.StartsWith("construction of bridge")
           || descToLower.StartsWith("construction of permanent bridge") || descToLower.StartsWith("const. of bridge")
           || descToLower.StartsWith("replacement of bridge")
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
            contract.Tags.Add("road");
            IncrementDict(dictTagDict, "road");
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
            contract.Tags.Add("flood");
            IncrementDict(dictTagDict, "flood");
            return;
        }

        if (descToLower.Contains("overpass") || descToLower.Contains("over-pass"))
        {
            contract.Tags.Add("overpass+underpass");
            IncrementDict(dictTagDict, "overpass+underpass");
            return;
        }

        if (descToLower.Contains("underpass") || descToLower.Contains("under-pass"))
        {
            contract.Tags.Add("overpass+underpass");
            IncrementDict(dictTagDict, "overpass+underpass");
            return;
        }

        if (descToLower.StartsWith("jct") || descToLower.Contains("bdry") || descToLower.Contains("center island"))
        {
            contract.Tags.Add("road");
            IncrementDict(dictTagDict, "road");
            return;
        }

        // Should be lower precedence because it can be a MPB with medical center or East Ave Medical Center
        if (descToLower.Contains("medical center") || descToLower.Contains("construction of building") )
        {
            if (!descToLower.Contains("institute")) // possibly a school
            {
                contract.Tags.Add("building");
                IncrementDict(dictTagDict, "building");
                return;
            }
        }

        if (descToLower.Contains("police") || descToLower.Contains("military") || descToLower.Contains("camp aguinaldo") 
        || descToLower.Contains("camp emilio aguinaldo") || descToLower.Contains("pnp") || descToLower.Contains("camp crame") 
        || descToLower.Contains("camp bagong") || descToLower.Contains("ncrpo") || descToLower.Contains("army aviation")
        || descToLower.Contains("defense") || descToLower.Contains("national security") || descToLower.Contains("afp")
        || descToLower.Contains("isafp") || descToLower.Contains("intelligence")
        )
        {            
            contract.Tags.Add("police+military");
            IncrementDict(dictTagDict, "police+military");
            return;
        }

        if (descToLower.Contains("up diliman") || descToLower.Contains("u.p. diliman") || descToLower.Contains("polytechnic") 
           || descToLower.Contains("school") || descToLower.Contains("academy") || descToLower.Contains("college")
           || descToLower.Contains("healthcare institute") || descToLower.Contains("institute of technology")
           || descToLower.Contains("science and tech") // DOST building will not come here because it has 'storey' building
           || descToLower.Contains("classroom") || descToLower.Contains("up mindanao") || descToLower.Contains("u.p. mindanao")
        )
        {
            if (!descToLower.Contains("leading to")) // exclude leading to, it's most likely a road
            {
                contract.Tags.Add("school");
                IncrementDict(dictTagDict, "school");
                return;
            }
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

        if (descToLower.Contains("water supply") || descToLower.Contains("water system")
           || descToLower.Contains("waterworks") || descToLower.Contains("watersystem")
           || descToLower.Contains("solar system") || descToLower.Contains("solar swater")
        )
        {            
            contract.Tags.Add("water supply");
            IncrementDict(dictTagDict, "water supply");
            return;
        }

        if (descToLower.Contains("cruise port")
        )
        {            
            contract.Tags.Add("cruise port");
            IncrementDict(dictTagDict, "cruise port");
            return;
        }

        // There can be MPB from schools and other govt agencies.
        // Exclude these as much as possible
        if (descToLower.Contains("purpose") || descToLower.Contains("evacuation") || descToLower.Contains("mpb") 
        || descToLower.Contains("convention") || descToLower.Contains("sport") || descToLower.Contains("skate")
        || descToLower.Contains("covered court") || descToLower.Contains("baseball") || descToLower.Contains("basketball")
        || descToLower.Contains("boxing") || descToLower.Contains("gym")
        )
        {
            contract.Tags.Add("multi");
            IncrementDict(dictTagDict, "multi");
            return;
        }        
    }

    private Dictionary<string, string> NOUN_KEYS_MAP = new Dictionary<string, string>()
    {
        {"road","road"},
        {" rd","road"},
        {"jct","road"},
        {"bypass","road"},
        {"highway","road"},
        {"avenue","road"},
        {"boulevard","road"},
        {"causeway","road"},
        {"bridge","bridge"},
        {" br.","bridge"}, // note cannot use "br" as it can be mistaken as brgy
        {" br ","bridge"}, // with space before and after
        {"building","building"},
        {"bldg.","building"},
        {"office","building"},
        {"brgy. hall", "building"},
        {"public market", "building"},
        {"government center", "building"},
        {"city hall", "building"},
        {"classroom", "school"},
    };

    // Not good because e.g. we want to find "construction of abc road", will also match "construction of xyz bridge along abc road"
    private bool MatchNounAndVerbViaRegex(string input, string verb, string noun)
    {
        // intentionally remove space before noun, calling function to add space if needed. There are lots of typos in DPWH project with
        string pattern = $"{verb} of (.+?){noun}"; 
        Regex regex = new Regex(pattern);
        Match match = regex.Match(input);

        if (input.StartsWith("construction of"))
        {
            int i =0;
        }

        return match.Success;
    }

    private string MatchNounAndVerbViaClosestIndex(string input, string startPhrase)
    {
        int indexStart = input.IndexOf(startPhrase);
        if (indexStart < 0) 
        {
            return null;
        }
        Dictionary<string, int> indicesMap = new Dictionary<string, int>();
        int currMinIdx = int.MaxValue;
        string currMinCat = null;
        foreach(string noun in NOUN_KEYS_MAP.Keys)
        {
            int currIdx = input.IndexOf(noun, indexStart + 1);
            if (currIdx >= 0 && currIdx < currMinIdx) 
            {
                currMinIdx = currIdx;
                currMinCat = noun;
            }
        }
        if (!string.IsNullOrEmpty(currMinCat) && NOUN_KEYS_MAP.ContainsKey(currMinCat))
        {
            return NOUN_KEYS_MAP[currMinCat];
        }
        return null;
    }

    private List<string> startPhrases = new List<string>() {
        "construction of",
        "const. of",
        "const'n of",
        "conc. of",
        "concreting of",
        "improvement of",
        "imprvt of",
        "imprvt. of",
        "impvt. of",
        "impvt of",
        "replacement of",
        "installation of",
        "completion of",
        "(completion) of",
        "compl. of",
        "compl.of",
        "upgrading of",
        "repair of",
        "retrofitting of",
        "renovation of",
        "strenghtening of",
        "strengthening of",
        "rehabilitation of",
        "rehabilitation along",
        "rehab. of",
        "maintenance of",
        "preservation of",
        "opening of",
        "maintenance -",
        "maintenance along",
        "(aspahlt overlay) along",
        "(asphalt overlay) along",
        "(asphalt overlay) along",
        "(asphalt to conc.) of",
        "(asphalt to concrete) of",
        "(concreting) of",
        "to paved) of",
    };
    private void CategorizeViaNounAndVerb(Contract contract, Dictionary<string, int> dictTagDict)
    {
        if (contract.Tags.Any())
        {
            return;
        }
        string descToLower = contract.Desc.ToLower();
        
        foreach(string startPhrase in startPhrases)
        {
            string cat = MatchNounAndVerbViaClosestIndex(descToLower, startPhrase);
            if (!string.IsNullOrEmpty(cat))
            {
                //cat = "idx-" + cat;
                contract.Tags.Add(cat);
                IncrementDict(dictTagDict, cat);
                //Console.WriteLine($"[{cat}] {contract.Desc}");
                break;
            }
        }
    }

    private readonly List<string> additionalForbiddenKeywords = new List<string>() {
        "river",
        "airport",
        "seaport",
        "dike",
        "water",
    };

    private List<string> bridgeKeywords = new List<string>() {
        "bridge",
        " br ",
        "br.",
    };
    private List<string> bldgKeywords = new List<string>() {
        "building",
        "bldg",
        "bldg.",
    };

    private List<string> roadKeywords = new List<string>() {
        "road",
        " rd ",
        " rd-",
        " rds ",
        " rd.",
        " rd,",
        " ave.",
        " ave.",
        " ave-",
        " ave ",
        "highway",
        "higway",
        "coastal rd",
        "coastal road",
        "service road",
        "service rd",
        "causeway",
    };
    [Flags]
    private enum existenceFlag {
        none = 0,
        hasRoad = 1,
        hasBridge = 2,
        hasBuilding = 4
    }

    // A bit of guesswork to categorize item if the project only has a single keyword
    // E.g. "abc road", "xyz bridge"
    // If the title contains multiple keywords, project will not be categorized to be sure (e.g. "xyz bridge" along "abc road")
    private void CategorizeSingleKeywordProjects(Contract contract, Dictionary<string, int> dictTagDict)
    {
        if (contract.Tags.Any())
        {
            return;
        }
        string descToLower = contract.Desc.ToLower(); 

        existenceFlag flagKeywords = existenceFlag.none;

        // [a] Check existence of road
        if (roadKeywords.Any(x => descToLower.Contains(x)))
        {
            flagKeywords |= existenceFlag.hasRoad;
        }
        if (bldgKeywords.Any(x => descToLower.Contains(x)))
        {
            flagKeywords |= existenceFlag.hasBuilding;
        }
        if (bridgeKeywords.Any(x => descToLower.Contains(x)))
        {
            flagKeywords |= existenceFlag.hasBridge;
        }

        bool containsMoreThan1Flag = (flagKeywords & (flagKeywords -1)) != 0; // Checks if power of 2
        if (containsMoreThan1Flag) {
            return;
        }

        if ((flagKeywords & existenceFlag.hasRoad) > 0)
        {
            contract.Tags.Add("road");
            IncrementDict(dictTagDict, "road");
            return;
        }
        if ((flagKeywords & existenceFlag.hasBridge) > 0)
        {
            contract.Tags.Add("bridge");
            IncrementDict(dictTagDict, "bridge");
            return;
        }
        if ((flagKeywords & existenceFlag.hasBuilding) > 0)
        {
            contract.Tags.Add("building");
            IncrementDict(dictTagDict, "building");
            return;
        }
    }

    private void CategorizeLeadingTo(Contract contract, Dictionary<string, int> dictTagDict)
    {
        if (contract.Tags.Any())
        {
            return;
        }
        string descToLower = contract.Desc.ToLower(); 
        int indexLeadTo = descToLower.IndexOf("leading to");
        if (indexLeadTo < 0) {
            return;
        }

        foreach(string bridgeKeyword in bridgeKeywords)
        {
            int indexBridge = descToLower.IndexOf(bridgeKeyword);
            if (indexBridge >= 0 && indexLeadTo > indexBridge)
            {
                contract.Tags.Add("bridge");
                IncrementDict(dictTagDict, "bridge");
                return;
            }
        }

        // by default, set as road
        contract.Tags.Add("road");
        IncrementDict(dictTagDict, "road");

    }
    
    // Lowest precedence categorizations
    private void CategorizeLowestPrecedence(Contract contract, Dictionary<string, int> dictTagDict)
    {
        if (contract.Tags.Any())
        {
            return;
        }

        string descToLower = contract.Desc.ToLower();
        string districtToLower = contract.DistrictOffice.ToLower();
        if (districtToLower.Contains("roads management"))
        {
            contract.Tags.Add("road");
            IncrementDict(dictTagDict, "road");
            return;
        }

        if (descToLower.Contains("daang maharlika") || descToLower.Contains("daan maharlika"))
        {
            contract.Tags.Add("road");
            IncrementDict(dictTagDict, "road");
            return;
        }
        
        // Maybe because also contains "road" or "building" so cannot be captured via single keyword
        if (descToLower.Contains("bridge along") ||
            descToLower.Contains("br. along") ||
            descToLower.Contains("br. 2 along"))
        {
            contract.Tags.Add("bridge");
            IncrementDict(dictTagDict, "bridge");
            return;
        }
        
        if (descToLower.Contains("municipal hall") || descToLower.Contains("function hall")) // usually a multipurpose building also, but if not specified as MPB, we classify as building
        {
            contract.Tags.Add("building");
            IncrementDict(dictTagDict, "building");
            return;
        }

        if (descToLower.Contains("river") || descToLower.Contains("dike") || descToLower.Contains("creek"))
        {
            contract.Tags.Add("river+dike+creek");
            IncrementDict(dictTagDict, "river+dike+creek");
            return;
        }

        if (descToLower.StartsWith("road") || descToLower.StartsWith("rd"))
        {
            contract.Tags.Add("road");
            IncrementDict(dictTagDict, "road");
            return;
        }
    }

    public void TestCategorize(string desc)
    {
        Contract contract = new Contract() {
            Desc = desc
        };

        Dictionary<string, int> dictTagDict = new Dictionary<string, int>(); // For debugging only

        CategorizeViaDistrict(contract, dictTagDict);
        CategorizeViaWordSearch(contract, dictTagDict);
        CategorizeViaNounAndVerb(contract, dictTagDict);
        CategorizeLeadingTo(contract, dictTagDict);
        CategorizeSingleKeywordProjects(contract, dictTagDict);
        CategorizeLowestPrecedence(contract, dictTagDict);
    }
}
