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
    if (dataState.Filters.District?.length > 0) {
        ret.push({id: 'district', value: dataState.Filters.District});
    }
    return ret;
}

export const TableByDistrict = (props) => {
    
    const [columnFilters, setColumnFilters] = useState([]);
    const [checkedStretch, setCheckedStretch] = useState(false);
    const [sorting, setSorting] = useState([{
        id: 'subtotal',
        desc: true
    }]);
    const {dataState} = props;
    
    console.log('[TableByDistrict] render, dataState:', dataState);

    const filteredDistrictGroups = dataState.FilteredData?.districtGroups;
    console.log('filteredDistrictGroups', filteredDistrictGroups);

    const columnDefs = [
        {
            accessorKey: "district",
            header: "District",
            filterFn: 'multiValueFilter',
            cell: ({ getValue, row, column, table }) => {
                let {masterData} = table.getState();
                return <div>{getMasterDataValue(masterData, EntityTypes.district, getValue())}</div>
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
        data: filteredDistrictGroups,
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
            entityGroups: dataState.FilteredData.districtGroups,
            maxCost: dataState.FilteredData.overallDistrictMaxCost,
            minCost: dataState.FilteredData.overallDistrictMinCost,
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
        dataState.Filters.Contractor,
        dataState.Filters.Category,
        dataState.Filters.ContractId,
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
                {prepareHeader(table, EntityTypes.district)}
            </thead>
            <tbody>
                {prepareBody(table, EntityTypes.district)}
            </tbody>
        </table>
    </div>;
}