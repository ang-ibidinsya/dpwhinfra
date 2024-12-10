using DataFetcher;


// See https://aka.ms/new-console-template for more information
Console.WriteLine("Data Fetcher Start");
var hf = new HttpFetcher();
await hf.FetchTest();

Console.WriteLine("Data Fetcher End");