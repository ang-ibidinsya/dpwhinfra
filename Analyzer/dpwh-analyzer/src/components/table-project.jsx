import './table-base.css';
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from 'react-redux';
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
  } from "@tanstack/react-table";
import { prepareBody, prepareHeader, preparePagninator } from './table-base';
import { formatMoney, convertStateToTableFilter, getMasterDataValue} from '../util';
import { BarChart} from '../controls/barchart';
import { MultiSelectCheckbox } from '../controls/multiselectCheckbox';
import { EntityTypes} from '../enums';
import {getShortCategoryTooltipMessage} from '../controls/controlUtils';

const BARCHART_ADJUSTER_MIN = 10;
const BARCHART_ADJUSTER_MAX = 10;

const columnDefs = [
    {
        accessorKey: "yr",
        header: "Year",
        filterFn: 'multiValueFilter',
        defaultColVisibility: true,
        cell: ({ getValue, row, column, table }) => {
        return <div>{getValue()}</div>
        },
    },
    {
        accessorKey: "frm",
        header: " Contract Effectivity",
        defaultColVisibility: false,
        cell: ({ getValue, row, column, table }) => {
                let val = getValue();
                if (val && val.length > 0) val = '20' + val;
                return <div className="divCenter">{val}</div>
            },
    },
    {
        accessorKey: "to",
        header: "Contract Expiration",
        defaultColVisibility: false,
        cell: ({ getValue, row, column, table }) => {
                let val = getValue();
                if (val && val.length > 0) val = '20' + val;
                return <div className="divCenter">{val}</div>
            },
    },    
    {
        accessorKey: "rgn",
        header: "Region",
        filterFn: 'multiValueFilter',
        defaultColVisibility: true,
        cell: ({ getValue, row, column, table }) => {
                let {masterData} = table.getState();
                return <div>{getMasterDataValue(masterData, EntityTypes.region, getValue())}</div>
            },
    },
    {
        accessorKey: "dst",
        header: "District",
        filterFn: 'multiValueFilter',
        defaultColVisibility: true,
        cell: ({ getValue, row, column, table }) => {
                let {masterData} = table.getState();
                return <div>{getMasterDataValue(masterData, EntityTypes.district, getValue())}</div>
            },
    },
    {
        accessorKey: "cat",
        header: <span style={{whiteSpace: 'nowrap'}}>
            <i className="bx bxs-flask bx-xs bx-fw" color="red"
                data-tooltip-id='generic-tooltip'
                data-tooltip-content={getShortCategoryTooltipMessage()}
            >
            </i>Category</span>,
        filterFn: 'multiValueFilter',
        defaultColVisibility: true,
        cell: ({ getValue, row, column, table }) => {
                let {masterData} = table.getState();
                return <div className="taggedValueContainer"><div className="taggedValue">{getMasterDataValue(masterData, EntityTypes.category, getValue())}</div></div>
            },
    },
    {
        accessorKey: "dsc",
        header: "Project",
        enableSorting: false, // disables sorting - from tanstack
        defaultColVisibility: true,
        cell: ({ getValue, row, column, table }) => {
            return <div className="itemDesc">{getValue()}</div>
        },
    },
    {
        accessorKey: "cId",
        header: "Contract ID",
        defaultColVisibility: true,
        cell: ({ getValue, row, column, table }) => {
            return <div className="itemDesc">{getValue()}</div>
        },
    },
    {
        accessorKey: "ctr",
        header: "Contractor(s)",
        filterFn: 'multiValueListFilter',
        defaultColVisibility: true,
        cell: ({ getValue, row, column, table }) => {
            let {masterData} = table.getState();
            let contractors = getMasterDataValue(masterData, EntityTypes.contractor, getValue());
            if (contractors.length == 0) {
                return null;
            }
            return <div className="itemDesc">{contractors.map((contractor, i) => <div key={i}>{`• ${contractor}`}</div>)
            }</div>
        },
    },
    {
        accessorKey: "src",
        header: "Fund Source",
        filterFn: 'multiValueFilter',
        defaultColVisibility: false,
        cell: ({ getValue, row, column, table }) => {
            let {masterData} = table.getState();
            return <div className="itemDesc">{getMasterDataValue(masterData, EntityTypes.fundSource, getValue())}</div>
        },
    },
    {
        accessorKey: "sts",
        header: "Status",
        filterFn: 'multiValueFilter',
        defaultColVisibility: true,
        // cell: rendered outside because unable to put background color properly here (unable for child to use up parent's entire cell area)
    },
    {
        accessorKey: "pct",
        header: "Progress",
        filterFn: 'multiValueFilter',
        defaultColVisibility: true,
        cell: ({ getValue, row, column, table }) => {
                return <div className="divCenter">{getValue()}%</div>
            },
    },
    {
        accessorKey: "p",
        header: "Cost",
        sortingFn: 'alphanumeric',
        defaultColVisibility: true,
        cell: ({ getValue, row, column, table }) => {                        
            return <div className="divCost">{formatMoney(getValue())}</div>;
        },
    },
    {
        accessorKey: "CostBar",
        header: "CostBar",
        defaultColVisibility: true,
        cell: ({ getValue, row, column, table }) => {
            let {minCost, maxCost} = table.getState();
            return <BarChart cost={row.getValue('p')} minCost={minCost} maxCost={maxCost} 
                        adjusterMin={BARCHART_ADJUSTER_MIN}
                        adjusterMax={BARCHART_ADJUSTER_MAX}/>;
        },
    },

];

const getDefaultColVisibility = () => {
    let ret = {};
    columnDefs.forEach(colDef => {
        ret[colDef.accessorKey] = colDef.defaultColVisibility;
    });

    return ret;
}

const showColumnSettings = (columnVisibility, handleColumnVisibilityChange) => {
    let options = columnDefs.map(c => {
        return {
            value: c.accessorKey,
            label: c.header
        }
    }).filter(c => c.value !== 'CostBar');

    let selectedVals = [];
    for(let key in columnVisibility) {
        if (!columnVisibility.hasOwnProperty(key)) continue;
        if (columnVisibility[key] === true) {
            selectedVals.push(options.find(o => o.value === key));
        }
    }

    return <MultiSelectCheckbox 
        options={options} 
        placeholder={null}
        onChange={(selectedCols) => handleColumnVisibilityChange(selectedCols)}
        value={selectedVals}
    />
}

/* For Project table only */
export const showGrandTotal = (table, costColumn, columnVisibility, handleColumnVisibilityChange) => {
    let rows = table.getFilteredRowModel().rows;
    let sum = 0;
    // Use for instead of foreach, for potential performance improvements
    for (let i = 0; i < rows.length; i++) {
        sum += rows[i].getValue(costColumn)
    }
    
    return <div className="grandTotalSettingsContainer">
        {showColumnSettings(columnVisibility, handleColumnVisibilityChange)}
        <div className="grandTotalSettings-fieldItemContainer">
            <div className="grandTotalLabel">SUBTOTAL:</div>
            <div className="grandTotalValue">{formatMoney(sum)}</div>
        </div>
    </div>;
}

export const TableByProject = (props) => {    
    const [columnFilters, setColumnFilters] = useState([]);
    const {dataState, setLoadingMsg} = props;
    const [columnVisibility, setColumnVisibility] = useState(getDefaultColVisibility());

    const table = useReactTable({
        data: dataState.AllData,
        columns: columnDefs,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            pagination: {
                pageSize: 20,
            },
            sorting: [
                // {
                //     id: 'p',
                //     desc: true
                // }
            ],
        },
        state: {
            columnFilters: columnFilters,
            masterData: dataState.MasterData,
            maxCost: dataState.FilteredData.overallProjMaxCost,
            minCost: dataState.FilteredData.overallProjMinCost,
            setLoadingMsg: setLoadingMsg,
            columnVisibility
        },
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        filterFns: {
            multiValueFilter: (row, columnId, filterValue) => {
                let ret = filterValue.includes(row.getValue(columnId));
                return ret;
            },
            multiValueListFilter: (row, columnId, filterValue) => {
                let cellVals = row.getValue(columnId);
                let ret = filterValue.some(filter => cellVals.includes(filter));
                return ret;
            }
        }
    })

    const handleColumnVisibilityChange = selectedColumns => {
        console.log('[ColumnSettings][handleChange] selectedColumns', selectedColumns);
        let allCols = getDefaultColVisibility();
        for (let key in allCols) {
            if (!allCols.hasOwnProperty(key)) continue;
            allCols[key] = selectedColumns.some(c => c.value === key);
        }
        allCols.CostBar = allCols.p; // Costbar always go hand in hand with Cost
      
        setColumnVisibility(allCols);
    };

    console.log('[TableByProject] render grandTotal', formatMoney(dataState.FilteredData.grandTotal), 'columns', );

    useEffect(() => {
        console.log('[Project Table UseEffect]');
        table.setColumnFilters(convertStateToTableFilter(dataState))
    }, [dataState.Filters.Project, dataState.Filters.Year, dataState.Filters.District, dataState.Filters.Region, 
        dataState.Filters.Status, dataState.Filters.FundSource, dataState.Filters.Contractor, dataState.Filters.Category, dataState.Filters.ContractId])


    return <>     
        {/* <LoadingIndicator isOverlay={true}/> */}
        {showGrandTotal(table, 'p', columnVisibility, handleColumnVisibilityChange)}
        {preparePagninator(table)}
        <table className="tableBase">
            <thead>
                {prepareHeader(table)}
            </thead>
            <tbody>
                {prepareBody(table, EntityTypes.project)}
            </tbody>
        </table>
        
    </>;
}