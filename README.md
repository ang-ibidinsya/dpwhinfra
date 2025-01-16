# Site Demo:
https://ang-ibidinsya.github.io/dpwhinfra/

# Projects inside:

## 1. DataFetcher/PlayWrightFetcher
Uses PlayWright (Typescript) to fetch data from DPWH Infra Projects site each and every Year + Region data
#### Output: HTML files (to be used later for offline analysis/parsing)

## 2. DataParser/HtmlDataParser
Uses C# HtmlAgilityPack library to parse the offline HTML files from Project#1 above.
#### Prerequisite/Dependency: The folder that contains the HTML files from Project#1 above.
#### Outputs 2 json files:
1. MasterData.json - All unique values for Region, District, Contractor, Status etc are assigned a numeric value, to be used in AllContracts.json below.
   Rationale:  to conserve file size since this will be used later on in the actual web application; perhaps better filter performance also since filtering by number is more performant than filtering by string.
2. AllContracts.json- raw data parsed from the HTML files above. Fields like Status, Contractor, Region, District etc use the numeric values from MasterData.json

## 3. DataParser/Categorizer (⚠️ Experimental Feature)
Uses C# to attempt to categorize each project, based on my own understanding/algorithm. Use with caution. Please report blatant misclassifications (for sure, there are).
Each contract ideally should be given 1 major category only, so that there won't be discrepancies when summing up the costs.
### Categorization Strategy (start with most-confident to least-confident categorization): 
1. Manual Categorization
   For a few contracts that are hard to categorize via algorithm, just use this approach
2. District Categorization
   For certain Central Office Districts (e.g. Central Office - Flood Control Management Cluster), contracts are directly assigned to a particular category
3. Phrase Search / Technical Keyword Search
   For contracts with technical keywords (e.g. contracts with "revetment" or "embankment" are automatically assigned to flood control) and phrase matches (e.g.  contract contains "construction of local road" - automatically assigned as road project)
4. Single Keyword search
   After several condition-checks in step 3, if the contract is still uncategorized, we check if the entire contract description only contains a single keyword, we just assume the contract is for that purpose
   E.g. 1. "ABC road" or "ABC ave." -> Will be categorized as "road" because it does not have other common keywords like "bridge" or "building"
   E.g. 2. "ABC road along XYZ bridge", "Access road near XYZ building" -> Won't be categorized because there are 2 common keywords
5. More Phase search
   If the contract is still uncategized after first 4 steps, we do more phrase matches (e.g. if contract contains "daang maharlika", just assume it is a road project)

* If it's hard to categorize a project, just leave it uncategorized.

**Challenges:**
- Wrong spellings ('contruction', 'higway', 'strenghtening')
- Different conventions ("construction" vs "const." vs "const'n" vs "conc.", "multi-purpose" vs "multipurpose" vs "mpb" vs "m-purpose" vs "multi - purpose")

**Other Ideas:** Use AI / machine learning to categorize the projects.

#### Prerequisite/Dependency: The 2 json files in Project #2
#### Outputs: 
1. Updated MasterData.json to add Category Numeric values
2. Updated AllContracts.json to add Category field for each contract
3. DpwhInfraProjects.xlsx - All parsed data so far (with Category values) in Excel format
   For those who'd rather use Excel to analyze the data. Excel generated using ClosedXml library.

## 4. Analyzer (Web Project)
#### Prerequite/Dependency: zip MasterData.json and AllContracts.json from the DataParser/Categorizer project into "AllContracts.json.zip"

