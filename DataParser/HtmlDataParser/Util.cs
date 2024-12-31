using System;
using System.Globalization;
using System.Net;
using System.Text;
using HtmlAgilityPack;

namespace HtmlDataParser;

public class Util
{
    public static string FindDropdownOption(HtmlDocument doc, string dropdownId)
    {
        var node = doc.DocumentNode.SelectSingleNode($"//*[@id='{dropdownId}']");
        if (node == null) {
            throw new Exception($"Unable to find Dropdown for id: {dropdownId}");
        }
        // Find selected option
        var selectedOption = node.ChildNodes.FirstOrDefault(n => n.Attributes.Any(a => a.Name == "selected"));
        if (selectedOption == null)
        {
            throw new Exception($"Unable to find Dropdown Selected Item for id: {dropdownId}");
        }
        string selectedItemStr = selectedOption.InnerText;
        Console.WriteLine($"Selected Dropdown: {selectedItemStr}");
        return selectedItemStr;
    }

    public static void ThrowIfNull(object objToCheck, string errIfNull)
    {
        if (objToCheck == null)
        {
            throw new Exception(errIfNull);
        }
    }
    public static void ThrowIfNotEqual(int val1, int val2, string errIfNull)
    {
        if (val1 != val2)
        {
            throw new Exception(errIfNull);
        }
    }

    public static List<string> GrabAllText(HtmlNode root)
    {
        List<string> retList = new List<string>();
        foreach (var node in root.DescendantsAndSelf())
        {
            if (!node.HasChildNodes)
            {
                string text = node.InnerText.Trim();
                text = WebUtility.HtmlDecode(text);
                if (string.IsNullOrEmpty(text))
                {
                    continue;
                }
                
                retList.Add(text);
            }
        }

        return retList;
    }

    public static CultureInfo PhCulture = CultureInfo.CreateSpecificCulture("en-ph");
    public static decimal ConvertMoneyStrToDec(string moneyStr)
    {
        return decimal.Parse(moneyStr, System.Globalization.NumberStyles.Currency, PhCulture);
    }

    public static DateTime ConvertToDate(string dateStr)
    {
        return DateTime.ParseExact(dateStr, "MMMM d, yyyy", PhCulture);
    }
}
