using HtmlDataParser;

Console.WriteLine("Start Parsing");
DpwhInfraParser p = new DpwhInfraParser();
//p.ParseFile("../../../../Data/2016-Central Office.html");
p.ParseAllData("../Data");

Console.WriteLine("Finished Parsing!");