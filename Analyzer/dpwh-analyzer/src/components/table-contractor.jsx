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
    if (dataState.Filters.Contractor?.length > 0) {
        ret.push({id: 'contractor', value: dataState.Filters.Contractor});
    }
    return ret;
}

export const TableByContractor = (props) => {
    
    const [columnFilters, setColumnFilters] = useState([]);
    const [sorting, setSorting] = useState([{
        id: 'subtotal',
        desc: true
    }]);
    const {dataState, setLoadingMsg} = props;
    
    console.log('[TableByContractor] render, dataState:', dataState);

    const filteredContractorGroups = dataState.FilteredData?.contractorGroups;
    console.log('filteredContractorGroups', filteredContractorGroups);

    const columnDefs = [
        {
            accessorKey: "contractor",
            header: "Contractor",
            filterFn: 'multiValueFilter',
            cell: ({ getValue, row, column, table }) => {
                let {masterData} = table.getState();
                return <div>{getMasterDataValue(masterData, EntityTypes.contractor, getValue())}</div>
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
            header: "CostBar"
        },
    ];

    const table = useReactTable({
        data: filteredContractorGroups,
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
            entityGroups: dataState.FilteredData.contractorGroups,
            maxCost: dataState.FilteredData.overallContractorMaxCost,
            minCost: dataState.FilteredData.overallContractorMinCost,
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
                {prepareBody(table, EntityTypes.contractor)}
            </tbody>
        </table>
    </div>;
}