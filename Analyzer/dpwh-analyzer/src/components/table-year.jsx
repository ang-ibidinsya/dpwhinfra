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
import {prepareBody, prepareHeader, preparePagninator, showGrandTotalDirectly} from './table-base';
import {formatMoney} from '../util';
import {BarChart} from '../controls/barchart';
import {EntityTypes} from '../enums';

const convertStateToTableFilter = (dataState) => {
    let ret = [{id: 'subtotal', value: null}];// Add a dummy subtotal filter, so that its custom filter can filter out 0 values
    if (dataState.Filters.Year?.length > 0) {
        ret.push({id: 'year', value: dataState.Filters.Year});
    }
    return ret;
}

export const TableByYear = (props) => {
    
    const [columnFilters, setColumnFilters] = useState([]);
    const {dataState} = props;
    
    console.log('[TableByYear] render, dataState:', dataState);

    const filteredYearGroups = dataState.FilteredData?.yearGroups;
    console.log('filteredYearGroups', filteredYearGroups);

    const columnDefs = [
        {
            accessorKey: "year",
            header: "Year",
            filterFn: 'multiValueFilter',
            cell: ({ getValue, row, column, table }) => {
            return <div>{getValue()}</div>
            },
        },
        {
            accessorKey: "subtotal",
            header: "Cost",
            filterFn: 'greaterThan0',
            cell: ({ getValue, row, column, table }) => {                
                return <div className="divCost">{formatMoney(getValue())}</div>
            },
        },
        {
            accessorKey: "CostBar",
            header: "CostBar",
            cell: ({ getValue, row, column, table }) => {
                let {minCost, maxCost} = table.getState();
                return <BarChart cost={row.getValue('subtotal')} minCost={minCost} maxCost={maxCost}/>;
            },
        },
    ];

    const table = useReactTable({
        data: filteredYearGroups,
        //data: dataAll,
        columns: columnDefs,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            pagination: {
                pageSize: 20,
            },
        },
        state: {
            columnFilters: columnFilters,
            maxCost: dataState.FilteredData.overallYearMaxCost,
            minCost: dataState.FilteredData.overallYearMinCost,
        },
        onColumnFiltersChange: setColumnFilters,
        filterFns: {
            multiValueFilter: (row, columnId, filterValue) => {
                let ret = filterValue.includes(row.getValue(columnId));
                return ret;
            },
            greaterThan0:(row, columnId, filterValue) => {
                return row.getValue(columnId) > 0
            }
        }
    })

    useEffect(() => {
        table.setColumnFilters(convertStateToTableFilter(dataState));
    }, [
        dataState.Filters.Project, 
        dataState.Filters.Year, 
        dataState.Filters.District, 
        dataState.Filters.Region,
        dataState.Filters.FundSource,
        dataState.Filters.Contractor,
        dataState.Filters.Category
    ])


    return <div className="tableContainer">
        {showGrandTotalDirectly(dataState.FilteredData.grandTotal)}
        {preparePagninator(table)}
        <table className="tableBase">
            <thead>
                {prepareHeader(table)}
            </thead>
            <tbody>
                {prepareBody(table, EntityTypes.year)}
            </tbody>
        </table>        
    </div>;
}