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
import {prepareBody, prepareHeader, preparePagninator, showYearLegends, showStatusLegends, showGrandTotalDirectlyWithSettings} from './table-base';
import {formatMoney, getMasterDataValue} from '../util';
import {EntityTypes} from '../enums';

const convertStateToTableFilter = (dataState) => {
    let ret = [{id: 'subtotal', value: null}];// Add a dummy subtotal filter, so that its custom filter can filter out 0 values
    if (dataState.Filters.FundSource?.length > 0) {
        ret.push({id: 'fundSource', value: dataState.Filters.FundSource});
    }
    return ret;
}

export const TableByFundSrc = (props) => {
    
    const [columnFilters, setColumnFilters] = useState([]);
    const [checkedStretch, setCheckedStretch] = useState(false);
    const [sorting, setSorting] = useState([{
        id: 'subtotal',
        desc: true
    }]);
    const {dataState} = props;
    
    console.log('[TableByFundSrc] render, dataState:', dataState);

    const filteredFundSrcGroups = dataState.FilteredData?.fundSrcGroups;
    console.log('filteredFundSrcGroups', filteredFundSrcGroups);

    const columnDefs = [
        {
            accessorKey: "fundSource",
            header: "Fund Source",
            filterFn: 'multiValueFilter',
            cell: ({ getValue, row, column, table }) => {
                let {masterData} = table.getState();
                return <div>{getMasterDataValue(masterData, EntityTypes.fundSource, getValue())}</div>
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
            accessorKey: "CostBarYear",
            header: "Cost by Year"
        },
        {
            accessorKey: "CostBarStatus",
            header: "Cost by Status",
            enableSorting: false, // disables sorting - from tanstack
        },
    ];

    const table = useReactTable({
        data: filteredFundSrcGroups,
        //data: dataAll,
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
            entityGroups: dataState.FilteredData.fundSrcGroups,
            maxCost: dataState.FilteredData.overallFundSourceMaxCost,
            minCost: dataState.FilteredData.overallFundSourceMinCost,
            masterData: dataState.MasterData,
            checkedStretch
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
        dataState.Filters.Category,
        dataState.Filters.ContractId,
        dataState.Filters.Contractor,
        dataState.Filters.JointVentures
    ])

    const handleCheckboxChange = (arg) => {
        setCheckedStretch(arg.target.checked); // Toggle the checkbox value
      };

    return <div className="tableContainer">
        {showGrandTotalDirectlyWithSettings(dataState.FilteredData.grandTotal, {checkedStretch, handleCheckboxChange})}
        {showYearLegends()}
        {showStatusLegends()}
        {preparePagninator(table)}
        <table className="tableBase">
            <thead>
                {prepareHeader(table, EntityTypes.fundSource)}
            </thead>
            <tbody>
                {prepareBody(table, EntityTypes.fundSource)}
            </tbody>
        </table>
    </div>;
}