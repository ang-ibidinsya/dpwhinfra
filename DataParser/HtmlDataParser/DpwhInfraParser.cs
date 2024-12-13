namespace HtmlDataParser;

using System.Text.Json;
using HtmlAgilityPack;

public class DpwhInfraParser
{
    private List<Contract> allContracts = new List<Contract>();
    private MasterData masterData = new MasterData();
    public void ParseAllData(string pathDir)
    {
        allContracts.Clear();
        if (!Directory.Exists(pathDir))
        {
            Console.WriteLine("Path does not exist");
            return;
        }
        string[] files = Directory.GetFiles(pathDir);
        foreach(string file in files)
        {
            Console.WriteLine($"[{DateTime.Now:HH:mm:ss.fff}] Parsing file: {file}");
            ParseFile(file);
        }
        Console.WriteLine($"Finished Parsing, found {allContracts.Count()} contracts");

        File.WriteAllText("AllContracts.json", JsonSerializer.Serialize(allContracts));
        File.WriteAllText("MasterData.json", JsonSerializer.Serialize(masterData));
        Console.WriteLine($"[{DateTime.Now:HH:mm:ss.fff}] Finished Writing!");
    }

    public void ParseFile(string filePath)
    {
        Console.WriteLine($"Start Parsing File: {filePath}");
        var doc = new HtmlDocument();

        try
        {
            doc.Load(filePath);
        }
        catch(Exception e)
        {
            Console.WriteLine($"Unable to load HTML Doc: {filePath}. Exception: ${e}");
            return;
        }

        string fileName = Path.GetFileNameWithoutExtension(filePath);
        string expectedYear = fileName.Substring(0, 4);
        string expectedRegion = fileName.Substring(5);
	
        // Sanity check: 
        // [a] Make sure we are parsing the correct Region
        string selectedRegion = Util.FindDropdownOption(doc, "ddlRegion");
        if (selectedRegion != expectedRegion)
        {
            throw new Exception($"Unexpected Region. Expected: {expectedRegion} vs {selectedRegion}");
        }

        // [b] Make sure we are parsing the correct year
        string selectedYear = Util.FindDropdownOption(doc, "ddlYear");
        if (selectedYear != expectedYear)
        {
            throw new Exception($"Unexpected Year. Expected: {expectedYear} vs {selectedYear}");
        }

        // Actual parsing
        // [a] Get All tables
        var allTables = doc.DocumentNode.SelectNodes("//tbody[@class='table-group-divider']");
        if (allTables == null)
        {
            Console.WriteLine("Unable to find table"); // Maybe really no result
            return;
        }
        Console.WriteLine($"Found Tables: {allTables.Count}");
        ushort iYear = ushort.Parse(selectedYear);
        
        foreach(HtmlNode tableNode in allTables)
        {
            Contract contract = ParseTable(tableNode, fileName, iYear, selectedRegion);
            ExtractContractMasterData(contract);
            allContracts.Add(contract);
        }
        
    }

    /* Expected Schema we are parsing:
    <table class="table-group-divider">
        <tr>                                // The first child that contains the data we need
            <th>1.                          // The sequence number; we ignore this
            <td>                            // First column
            <td>                            // Second column
            <td>                            // Third column
            <td>                            // Fourth column
        <tr>                                // 2nd child; just a spacer; ignore
            <td>                            // Ignore
    */
    private Contract ParseTable(HtmlNode tableNode, string fileName, ushort year, string region)
    {
        HtmlNode firstTr = tableNode.Element("tr");
        Util.ThrowIfNull(firstTr, "Unable to find tr inside table");

        IEnumerable<HtmlNode> tdNodes = firstTr.Elements("td");
        Util.ThrowIfNull(tdNodes, "Unable to find td's inside table");
        Util.ThrowIfNotEqual(tdNodes.Count(), 4, "Unexpected Count of td's");

        int iCol = 0;
        Contract ret = new Contract();
        ret.HtmlFile = fileName;
        ret.Year = year;
        ret.Region = region;
        foreach(HtmlNode tdNode in tdNodes)
        {
            List<string> strList = Util.GrabAllText(tdNode);
            if (iCol == 0)
            {
                if (strList.Count() < 5)
                {
                    throw new Exception("Unexpected number of values in contractor info");
                }
                ret.ContractId = strList[0];
                int idxA = strList.IndexOf("a)");
                int idxB = strList.IndexOf("b)");
                int idxC = strList.IndexOf("c)");
                int idxD = strList.IndexOf("d)");

                if (strList[idxA+1] != "b)")
                {
                    ret.Desc = strList[idxA+1];
                }
                else
                {
                    Console.WriteLine("[Warning] Does not have Description");
                }
                if (strList[idxB+1] != "c)")
                {
                    ret.Contractor = strList[idxB+1];
                }
                else
                {
                    Console.WriteLine("[Warning] Does not have Contractor");
                }
                if (strList[idxC+1] != "d)")
                {
                    ret.DistrictOffice = strList[idxC+1];
                }
                else
                {
                    Console.WriteLine("[Warning] Does not have DistrictOffice");
                }
                if (strList.Count() - 1 == idxD)
                {
                    Console.WriteLine("[Warning] Does not have Source of Funds");
                }
                else
                {
                    ret.SourceOfFunds = strList[idxD+1];
                }
            }
            else if (iCol == 1)
            {
                if (strList.Count() == 1)
                {
                    ret.Cost = Util.ConvertMoneyStrToDec(strList[0]);
                }
                else
                {
                    Console.WriteLine("[Warning] Does not have cost");
                }
            }
            else if (iCol == 2)
            {
                int idxA = strList.IndexOf("a)");
                int idxB = strList.IndexOf("b)");
                if (strList[idxA+1] == "b)")
                {
                    Console.WriteLine("[Warning] Does not have StartDate");
                }
                else
                {
                    ret.StartDate = Util.ConvertToDate(strList[idxA+1]);
                }
                if (strList.Count() - 1 == idxB)
                {
                    Console.WriteLine("[Warning] Does not have EndDate");
                }
                else
                {
                    ret.EndDate = Util.ConvertToDate(strList[idxB+1]);
                }
            }
            else if (iCol == 3)
            {
                int idxA = strList.IndexOf("a)");
                int idxB = strList.IndexOf("b)");
                if (strList[idxA+1] == "b)")
                {
                    Console.WriteLine("[Warning] Does not have Status");
                }
                else
                {
                    ret.Status = strList[idxA+1];
                }
                if (strList.Count() - 1 == idxB)
                {
                    Console.WriteLine("[Warning] Does not have StatusPercent");
                }
                else
                {
                    ret.Percent = float.Parse(strList[idxB+1]);
                }
            }
            iCol++;
        }

        return ret;
    }

    private void ExtractContractMasterData(Contract contract)
    {
        if (!masterData.RegionMap.ContainsKey(contract.Region))
        {
            masterData.RegionMap.Add(contract.Region, (ushort)masterData.RegionMap.Count);
        }
        contract.RegionId = masterData.RegionMap[contract.Region];

        if (!masterData.DistrictMap.ContainsKey(contract.DistrictOffice))
        {
            masterData.DistrictMap.Add(contract.DistrictOffice, (ushort)masterData.DistrictMap.Count);
        }
        contract.DistrictOfficeId = masterData.DistrictMap[contract.DistrictOffice];

        if (!masterData.StatusMap.ContainsKey(contract.Status))
        {
            masterData.StatusMap.Add(contract.Status, (ushort)masterData.StatusMap.Count);
        }
        contract.StatusId = masterData.StatusMap[contract.Status];

        if (contract.Contractor != null)
        {
            if (!masterData.ContractorMap.ContainsKey(contract.Contractor))
            {
                masterData.ContractorMap.Add(contract.Contractor, (ushort)masterData.ContractorMap.Count);
            }
            contract.ContractorId = masterData.ContractorMap[contract.Contractor];
        }

        if (!masterData.SourceMap.ContainsKey(contract.SourceOfFunds))
        {
            masterData.SourceMap.Add(contract.SourceOfFunds, (ushort)masterData.SourceMap.Count);
        }
        contract.SourceOfFundsId = masterData.SourceMap[contract.SourceOfFunds];          
    }
}   