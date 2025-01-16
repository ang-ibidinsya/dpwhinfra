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
import {prepareBody, prepareHeader, preparePagninator, showYearLegends, showGrandTotalDirectly} from './table-base';
import {formatMoney, getMasterDataValue} from '../util';
import {EntityTypes} from '../enums';

const convertStateToTableFilter = (dataState) => {
    let ret = [{id: 'subtotal', value: null}];// Add a dummy subtotal filter, so that its custom filter can filter out 0 values
    if (dataState.Filters.Category?.length > 0) {
        ret.push({id: 'category', value: dataState.Filters.Category});
    }
    return ret;
}

export const TableByCategory = (props) => {
    
    const [columnFilters, setColumnFilters] = useState([]);
    const [sorting, setSorting] = useState([{
        id: 'subtotal',
        desc: true
    }]);
    const {dataState, setLoadingMsg} = props;
    
    console.log('[TableByCategory] render, dataState:', dataState);

    const filteredCategoryGroups = dataState.FilteredData?.categoryGroups;
    console.log('filteredCategoryGroups', filteredCategoryGroups);

    const columnDefs = [
        {
            accessorKey: "category",
            header: "Category",
            filterFn: 'multiValueFilter',
            // cell: ({ getValue, row, column, table }) => {
            //     let {masterData} = table.getState();
            //     return <div>{getMasterDataValue(masterData, EntityTypes.category, getValue())}</div>
            // },
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
            header: "CostBar"
        },
    ];

    const table = useReactTable({
        data: filteredCategoryGroups,
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
        },
        state: {
            sorting,
            columnFilters: columnFilters,
            entityGroups: dataState.FilteredData.categoryGroups,
            maxCost: dataState.FilteredData.overallCategoryMaxCost,
            minCost: dataState.FilteredData.overallCategoryMinCost,
            masterData: dataState.MasterData,
            setLoadingMsg: setLoadingMsg
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
        dataState.Filters.Category,
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
                {prepareBody(table, EntityTypes.category)}
            </tbody>
        </table>
    </div>;
}