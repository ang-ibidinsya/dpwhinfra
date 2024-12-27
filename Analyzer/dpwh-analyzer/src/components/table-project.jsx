import './table-base.css';
import { useEffect, useMemo, useState } from "react";
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
  } from "@tanstack/react-table";
import {prepareBody, prepareHeader, preparePagninator, showGrandTotal} from './table-base';
import {formatMoney, convertStateToTableFilter} from '../util';
import {BarChart} from '../controls/barchart';
import {EntityTypes} from '../enums';
import {getMasterDataValue, statusColorMap} from '../util';
import {LoadingIndicator} from './loadingIndicator';

const columnDefs = [
    {
        accessorKey: "yr",
        header: "Year",
        filterFn: 'multiValueFilter',
        cell: ({ getValue, row, column, table }) => {
        return <div>{getValue()}</div>
        },
    },
    {
        accessorKey: "frm",
        header: " Contract Effectivity",
        cell: ({ getValue, row, column, table }) => {
                let val = getValue();
                if (val && val.length > 0) val = '20' + val;
                return <div className="divCenter">{val}</div>
            },
    },
    {
        accessorKey: "to",
        header: "Contract Expiration",
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
        cell: ({ getValue, row, column, table }) => {
                let {masterData} = table.getState();
                return <div>{getMasterDataValue(masterData, EntityTypes.region, getValue())}</div>
            },
    },
    {
        accessorKey: "dst",
        header: "District",
        filterFn: 'multiValueFilter',
        cell: ({ getValue, row, column, table }) => {
                let {masterData} = table.getState();
                return <div>{getMasterDataValue(masterData, EntityTypes.district, getValue())}</div>
            },
    },
    {
        accessorKey: "dsc",
        header: "Project",
        enableSorting: false, // disables sorting - from tanstack
        cell: ({ getValue, row, column, table }) => {
            return <div className="itemDesc">{getValue()}</div>
        },
    },
    {
        accessorKey: "cId",
        header: "Contract ID",
        cell: ({ getValue, row, column, table }) => {
            return <div className="itemDesc">{getValue()}</div>
        },
    },
    {
        accessorKey: "ctr",
        header: "Contractor(s)",
        filterFn: 'multiValueFilter',
        cell: ({ getValue, row, column, table }) => {
            let {masterData} = table.getState();
            return <div className="itemDesc">{getMasterDataValue(masterData, EntityTypes.contractor, getValue())}</div>
        },
    },
    {
        accessorKey: "src",
        header: "Fund Source",
        filterFn: 'multiValueFilter',
        cell: ({ getValue, row, column, table }) => {
            let {masterData} = table.getState();
            return <div className="itemDesc">{getMasterDataValue(masterData, EntityTypes.fundSource, getValue())}</div>
        },
    },
    {
        accessorKey: "sts",
        header: "Status",
        filterFn: 'multiValueFilter',
        // cell: rendered outside because unable to put background color properly here (unable for child to use up parent's entire cell area)
    },
    {
        accessorKey: "pct",
        header: "Progress",
        filterFn: 'multiValueFilter',
        cell: ({ getValue, row, column, table }) => {
                return <div className="divCenter">{getValue()}%</div>
            },
    },
    {
        accessorKey: "p",
        header: "Cost",
        sortingFn: 'alphanumeric',
        cell: ({ getValue, row, column, table }) => {                        
            return <div className="divCost">{formatMoney(getValue())}</div>;
        },
    },
    {
        accessorKey: "CostBar",
        header: "CostBar",
        cell: ({ getValue, row, column, table }) => {
            let {minCost, maxCost} = table.getState();
            return <BarChart cost={row.getValue('p')} minCost={minCost} maxCost={maxCost}/>;
        },
    },

];

export const TableByProject = (props) => {
    console.log('[TableByProject] render');

    const [columnFilters, setColumnFilters] = useState([]);
    const {dataState, setLoadingMsg} = props;

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
            ]
        },
        state: {
            columnFilters: columnFilters,
            masterData: dataState.MasterData,
            maxCost: dataState.FilteredData.overallProjMaxCost,
            minCost: dataState.FilteredData.overallProjMinCost,
            setLoadingMsg: setLoadingMsg
        },
        onColumnFiltersChange: setColumnFilters,
        filterFns: {
            multiValueFilter: (row, columnId, filterValue) => {
                if (row.getValue('cId')  === '16CE0155') {
                    console.log('[multiValueFilter] 16CE0155 filter:', filterValue);
                }
                let ret = filterValue.includes(row.getValue(columnId));
                return ret;
            }
        }
    })

    useEffect(() => {
        console.log('[Project Table UseEffect]');
        table.setColumnFilters(convertStateToTableFilter(dataState))
    }, [dataState.Filters.Project, dataState.Filters.Year, dataState.Filters.District, dataState.Filters.Region, 
        dataState.Filters.Status, dataState.Filters.FundSource, dataState.Filters.Contractor])


    return <>     
        {/* <LoadingIndicator isOverlay={true}/> */}
        {showGrandTotal(table, 'p')}
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