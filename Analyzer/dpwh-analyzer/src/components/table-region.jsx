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
import {prepareBody, prepareHeader, preparePagninator, showYearLegends, showGrandTotalDirectly, createToolTip} from './table-base';
import {formatMoney, getMasterDataValue} from '../util';
import {EntityTypes} from '../enums';

const convertStateToTableFilter = (dataState) => {
    let ret = [{id: 'subtotal', value: null}];// Add a dummy subtotal filter, so that its custom filter can filter out 0 values
    if (dataState.Filters.Region?.length > 0) {
        ret.push({id: 'region', value: dataState.Filters.Region});
    }
    return ret;
}

export const TableByRegion = (props) => {
    
    const [columnFilters, setColumnFilters] = useState([]);
    const [sorting, setSorting] = useState([{
        id: 'subtotal',
        desc: true
    }])
    const {dataState} = props;
    
    console.log('[TableByRegion] render, dataState:', dataState);

    const filteredRegionGroups = dataState.FilteredData?.regionGroups;
    console.log('filteredRegionGroups', filteredRegionGroups);

    const columnDefs = [
        {
            accessorKey: "region",
            header: "Region",
            filterFn: 'multiValueFilter',
            cell: ({ getValue, row, column, table }) => {
                let {masterData} = table.getState();
                return <div>{getMasterDataValue(masterData, EntityTypes.region, getValue())}</div>
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
        },
    ];

    const table = useReactTable({
        data: filteredRegionGroups,
        columns: columnDefs,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        initialState: {
            pagination: {
                pageSize: 20,
            },
            sorting: [
                
            ]
        },
        state: {
            sorting,
            columnFilters: columnFilters,
            entityGroups: dataState.FilteredData.regionGroups,
            maxCost: dataState.FilteredData.overallRegionMaxCost,
            minCost: dataState.FilteredData.overallRegionMinCost,
            masterData: dataState.MasterData,
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
    ])

    return <div className="tableContainer">
        {showYearLegends()}
        {showGrandTotalDirectly(dataState.FilteredData.grandTotal)}
        {preparePagninator(table)}
        <table className="tableBase">
            <thead>
                {prepareHeader(table)}
            </thead>
            <tbody>
                {prepareBody(table, EntityTypes.region)}
            </tbody>
            {/* {createToolTip('my-tooltip')} */}
        </table>    
    </div>;
}