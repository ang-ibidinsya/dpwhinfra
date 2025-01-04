using Categorizer;

Console.WriteLine($"[{DateTime.Now:HH:mm:ss.fff}] Categorizer Start");
ProjectCategorizer c = new ProjectCategorizer();
c.LoadData("Data/MasterData.json", "Data/AllContracts.json");

Console.WriteLine($"[{DateTime.Now:HH:mm:ss.fff}] Categorizer Finished");