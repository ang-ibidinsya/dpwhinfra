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
import {prepareBody, prepareHeader, preparePagninator, showYearLegends, showYearAndCategoryLegends, showGrandTotalDirectly} from './table-base';
import {formatMoney, getMasterDataValue} from '../util';
import {EntityTypes} from '../enums';
import {getShortCategoryTooltipMessage, getContractorCostTooltipMessage, getContractorFilterTooltipMessage} from '../controls/controlUtils';

const convertStateToTableFilter = (dataState) => {
    let ret = [{id: 'subtotal', value: null}];// Add a dummy subtotal filter, so that its custom filter can filter out 0 values
    if (dataState.Filters.Contractor?.length > 0) {
        ret.push({id: 'contractor', value: dataState.Filters.Contractor});
    }
    return ret;
}

const showStretchCheckbox = (checkboxState) => {
    return <label className="chkboxGrandTotalSetting">
    <input 
        type="checkbox"
        value="chkStretch"
        checked={checkboxState.checkedStretch}
        onChange={checkboxState.handleCheckboxChange}/>
        <span>Stretch All Bar Charts to Full Width</span>
    </label>
}

const showGrandTotalDirectlyWithSettings = (grandTotal, checkboxState) => {
    return <div className="grandTotalSettingsContainer">
        {showStretchCheckbox(checkboxState)}  
        <div className="grandTotalSettings-fieldItemContainer">
            <div className="grandTotalLabel">SUBTOTAL:</div>
            <div className="grandTotalValue">{formatMoney(grandTotal)}</div>
        </div>
    </div>;
}

export const TableByContractor = (props) => {
    
    const [columnFilters, setColumnFilters] = useState([]);
    const [checkedStretch, setCheckedStretch] = useState(false);
    const [sorting, setSorting] = useState([{
        id: 'subtotal',
        desc: true
    }]);
    const {dataState, setLoadingMsg} = props;
    
    console.log('[TableByContractor] render, dataState:', dataState);

    const filteredContractorGroups = dataState.FilteredData?.contractorGroups;
    const categoryMaster = dataState.MasterData.CategoryMaster;
    console.log('filteredContractorGroups', filteredContractorGroups);

    const columnDefs = [
        {
            accessorKey: "contractor",
            header: <span><span 
                data-tooltip-id='generic-tooltip'
                data-tooltip-content={getContractorFilterTooltipMessage()}
                style={{fontWeight: '400', cursor: 'pointer'}}>🛈 </span>Contractor</span>,
            filterFn: 'multiValueFilter',
            cell: ({ getValue, row, column, table }) => {
                let {masterData} = table.getState();
                return <div>{getMasterDataValue(masterData, EntityTypes.contractor, getValue())}</div>
            },
        },
        {
            accessorKey: "subtotal",
            header: <span><span 
                data-tooltip-id='generic-tooltip'
                data-tooltip-content={getContractorCostTooltipMessage()}
                style={{fontWeight: '400', cursor: 'pointer'}}>🛈 </span>Cost</span>,
            filterFn: 'greaterThan0',
            cell: ({ getValue, row, column, table }) => {
                return <div className="divCost">{formatMoney(getValue())}</div>
            },
        },
        {
            accessorKey: "CostBarYear",
            header: "Cost by Year",
            enableSorting: false, // disables sorting - from tanstack
        },
        {
            accessorKey: "CostBarCategory",
            header: <span style={{whiteSpace: 'nowrap'}}>
                <i className="bx bxs-flask bx-xs bx-fw" color="red"
                    data-tooltip-id='generic-tooltip'
                    data-tooltip-content={getShortCategoryTooltipMessage()}
                ></i>
                Cost by Category</span>,
            enableSorting: false, // disables sorting - from tanstack
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
            setLoadingMsg: setLoadingMsg,
            categoryMaster,
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
        dataState.Filters.ContractId,
        dataState.Filters.JointVentures
    ])

    const handleCheckboxChange = (arg) => {
        setCheckedStretch(arg.target.checked); // Toggle the checkbox value
      };

    return <div className="tableContainer">
        {showYearAndCategoryLegends(categoryMaster)}
        {showGrandTotalDirectlyWithSettings(dataState.FilteredData.grandTotal, {checkedStretch, handleCheckboxChange})}
        {preparePagninator(table)}
        <table className="tableBase">
            <thead>
                {prepareHeader(table, EntityTypes.contractor)}
            </thead>
            <tbody>
                {prepareBody(table, EntityTypes.contractor)}
            </tbody>
        </table>
    </div>;
}