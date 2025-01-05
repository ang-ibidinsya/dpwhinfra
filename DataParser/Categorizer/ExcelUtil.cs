using System;
using ClosedXML.Excel;
using Categorizer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Categorizer;

public class ExcelUtil
{
    private readonly int ROW_COLHEADERS = 1;
    private readonly int COL_YEAR = 1;
    private readonly int COL_FROM = 2;
    private readonly int COL_TO = 3;
    private readonly int COL_REGION = 4;
    private readonly int COL_DISTRICT = 5;
    private readonly int COL_CONTRACTID = 6;
    private readonly int COL_ITEM = 7;
    private readonly int COL_CONTRACTOR = 8;
    private readonly int COL_TAGS = 9;
    private readonly int COL_COST = 10;
    private readonly int COL_STATUS = 11;
    private readonly int COL_PROGRESS = 12;
    private readonly int COL_SRC = 13;
    
    private readonly int COL_GRANDTOTAL_LBL = 14;
    private readonly int COL_GRANDTOTAL = 15;
    private readonly int COL_FILTEREDTOTAL_LBL = 16;
    private readonly int COL_FILTEREDTOTAL = 17;

    public void GenerateExcel(IEnumerable<Contract> allItems)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.AddWorksheet("DPWH Infrastructure Projects");
        // [A] Headers
        worksheet.Cell(ROW_COLHEADERS, COL_YEAR).Value = "Year";
        worksheet.Cell(ROW_COLHEADERS, COL_FROM).Value = "Contract Effectivity";
        worksheet.Cell(ROW_COLHEADERS, COL_TO).Value = "Contract Expiration";
        worksheet.Cell(ROW_COLHEADERS, COL_REGION).Value = "Region";
        worksheet.Cell(ROW_COLHEADERS, COL_DISTRICT).Value = "District";
        worksheet.Cell(ROW_COLHEADERS, COL_CONTRACTID).Value = "ContractID";
        worksheet.Cell(ROW_COLHEADERS, COL_ITEM).Value = "Item";
        worksheet.Cell(ROW_COLHEADERS, COL_CONTRACTOR).Value = "Contractor(s)";
        worksheet.Cell(ROW_COLHEADERS, COL_TAGS).Value = "Tags";
        worksheet.Cell(ROW_COLHEADERS, COL_COST).Value = "Cost";
        worksheet.Cell(ROW_COLHEADERS, COL_STATUS).Value = "Status";
        worksheet.Cell(ROW_COLHEADERS, COL_PROGRESS).Value = "Progress";
        worksheet.Cell(ROW_COLHEADERS, COL_SRC).Value = "Fund Source";
        
        worksheet.Cell(ROW_COLHEADERS, COL_GRANDTOTAL_LBL)
            .SetValue("Grand Total")
            .Style.Fill.SetBackgroundColor(XLColor.LightBlue);
        worksheet.Cell(ROW_COLHEADERS, COL_FILTEREDTOTAL_LBL)
            .SetValue("Filtered Total")
            .Style.Fill.SetBackgroundColor(XLColor.BurlyWood);

        // Add Formatting        
        worksheet.Column(COL_YEAR).Width = 8;
        worksheet.Column(COL_REGION).Width = 18;
        worksheet.Column(COL_DISTRICT).Width = 50;
        worksheet.Column(COL_ITEM).Width = 80;
        worksheet.Column(COL_CONTRACTOR).Width = 80;
        worksheet.Column(COL_TAGS).Width = 20;
        worksheet.Column(COL_COST).Width = 20;
        worksheet.Column(COL_STATUS).Width = 15;
        worksheet.Column(COL_PROGRESS).Width = 20;
        worksheet.Column(COL_SRC).Width = 50;
        worksheet.Column(COL_GRANDTOTAL_LBL).Width = 15;
        worksheet.Column(COL_GRANDTOTAL).Width = 25;
        worksheet.Column(COL_FILTEREDTOTAL_LBL).Width = 18;
        worksheet.Column(COL_FILTEREDTOTAL).Width = 25;
        worksheet.Range(ROW_COLHEADERS, COL_YEAR, ROW_COLHEADERS, COL_FILTEREDTOTAL).Style.Font.Bold = true;
        worksheet.Range(ROW_COLHEADERS, COL_YEAR, ROW_COLHEADERS, COL_SRC).Style.Fill.BackgroundColor = XLColor.Beige;        

        // [B] Rows
        int iXlRow = ROW_COLHEADERS;
        foreach (Contract item in allItems)
        {
            iXlRow++;
            worksheet.Cell(iXlRow, COL_YEAR).Value = item.Year;
            worksheet.Cell(iXlRow, COL_FROM).Value = item.StartDateStr;
            worksheet.Cell(iXlRow, COL_TO).Value = item.EndDateStr;
            worksheet.Cell(iXlRow, COL_REGION).Value = item.Region;
            worksheet.Cell(iXlRow, COL_DISTRICT).Value = item.DistrictOffice.Substring(item.DistrictOffice.IndexOf('-')).Trim();
            worksheet.Cell(iXlRow, COL_CONTRACTID).Value = item.ContractId;
            worksheet.Cell(iXlRow, COL_ITEM).Value = item.Desc;
            worksheet.Cell(iXlRow, COL_CONTRACTOR).Value = string.Join("\r\n", item.Contractors.Select(ctr => $"• {ctr}"));
            worksheet.Cell(iXlRow, COL_TAGS).Value = string.Join("\r\n", item.Tags.Select(ctr => $"• {ctr}"));
            worksheet.Cell(iXlRow, COL_COST).Value = item.Cost;
            worksheet.Cell(iXlRow, COL_STATUS).Value = item.Status;
            worksheet.Cell(iXlRow, COL_PROGRESS).Value = item.Percent;
            worksheet.Cell(iXlRow, COL_SRC).Value = item.SourceOfFunds;
        }

        IXLRange allCells = worksheet.Range(ROW_COLHEADERS, COL_YEAR, iXlRow, COL_SRC);
        allCells.Style.Border.InsideBorder = XLBorderStyleValues.Thin;
        allCells.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        IXLRange filterableCells = worksheet.Range(ROW_COLHEADERS, COL_YEAR, iXlRow, COL_DISTRICT);
        filterableCells.SetAutoFilter();

        // Filter the tags also 
        filterableCells = worksheet.Range(ROW_COLHEADERS, COL_TAGS, iXlRow, COL_TAGS);
        filterableCells.SetAutoFilter();

        worksheet.Range(ROW_COLHEADERS + 1, COL_COST, iXlRow, COL_COST)
            .Style.Font.SetFontName("Courier New") // For easier reading numbers (alignment)
            .NumberFormat.Format = "#,##0.00";

        worksheet.Range(ROW_COLHEADERS + 1, COL_COST, iXlRow, COL_PROGRESS)
            .Style.Font.SetFontName("Courier New") // For easier reading numbers (alignment)
            .NumberFormat.Format = "#,##0.00";

        // [C Formula]
        worksheet.Cell(ROW_COLHEADERS, COL_GRANDTOTAL).SetFormulaA1("=SUM(J:J)")
            .Style.Font.SetFontName("Courier New") // For easier reading numbers (alignment)
            .NumberFormat.Format = "#,##0.00";
       
        worksheet.Cell(ROW_COLHEADERS, COL_FILTEREDTOTAL).SetFormulaA1("=SUBTOTAL(9,J:J)")
            .Style.Font.SetFontName("Courier New") // For easier reading numbers (alignment)
            .NumberFormat.Format = "#,##0.00";

        workbook.SaveAs("DpwhInfraProjects.xlsx");

    }
}
