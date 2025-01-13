import './table-base.css';
import { useEffect, useMemo, useState, useRef } from "react";
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
  } from "@tanstack/react-table";
import { Tooltip } from 'react-tooltip';
import { formatMoney, formatNumber, getMasterDataValue, statusColorMap } from '../util';
import { useSelector, useDispatch} from 'react-redux';
import 'react-tooltip/dist/react-tooltip.css';
import { EntityTypes} from '../enums';
import { LoadingIndicator} from '../controls/loadingIndicator';
import { TableByProject } from './table-project';
import { TableByYear} from './table-year';
import { TableByRegion } from './table-region';
import { TableByDistrict} from './table-district';
import { mapYearColors, StackedBarChart, getCategoryColor } from '../controls/stackedbarchart';
import { TableByFundSrc } from './table-fundsrc';
import { TableByContractor } from './table-contractor';
import { TableByCategory } from './table-category';

const iconSortLookup = {
    'asc': 'bx bxs-chevron-up-circle',
    'desc': 'bx bxs-chevron-down-circle',
}

export const showYearLegends = () => {
    let legendsEl = [];
    for (var year in mapYearColors) {
        if (!Object.prototype.hasOwnProperty.call(mapYearColors, year)) {
            continue;
        }
        legendsEl.push(<div key={`legend-${year}`} className="legendItem">
            <div className='legendSquare' style={{backgroundColor:`${mapYearColors[year]}`}}/>
            <div className='legendLabel'>{year}</div>
        </div>);
    }

    return <div className='legendsContainer'>
        <div className="legendItemsContainer">{legendsEl}</div>        
    </div>;
}

export const showYearAndCategoryLegends = (categoryMaster) => {
    let legendsCatEl = [];
    for (var cat in categoryMaster) {
        if (!Object.prototype.hasOwnProperty.call(categoryMaster, cat)) {
            continue;
        }
        legendsCatEl.push(<div key={`legend-${cat}`} className="legendItem">
            <div className='legendSquare' style={{backgroundColor:`${getCategoryColor(cat)}`}}/>
            <div className='legendLabel'>{categoryMaster[cat]}</div>
        </div>);
    }
    let legendsYearEl = [];
    for (var year in mapYearColors) {
        if (!Object.prototype.hasOwnProperty.call(mapYearColors, year)) {
            continue;
        }
        legendsYearEl.push(<div key={`legend-${year}`} className="legendItem">
            <div className='legendSquare' style={{backgroundColor:`${mapYearColors[year]}`}}/>
            <div className='legendLabel'>{year}</div>
        </div>);
    }

    return <div className='legendsGrid-container'>        
            <div className='legendsGrid-group-title legendsGrid-item-bottom-border'>Years: </div>
            <div className='legendsGrid-group-item-container legendsGrid-item-bottom-border'>{legendsYearEl}</div>
                
            <div className='legendsGrid-group-title'>Categories: </div>
            <div className='legendsGrid-group-item-container'>{legendsCatEl}</div>        
    </div>;
}

export const createChartToolTip = (tooltipId) => {
    return <Tooltip
    id={tooltipId}
    opacity={1}
    clickable={true}
    float={true}
    style={{ background: "black", color: "#fff" }}
    render={({ content }) => {
        let subtotalsMap = JSON.parse(content);
        if (!subtotalsMap) {
            console.log('[ToolTip] Render -- NULL', content);
            return "NULL";
        }
        console.log('[ToolTip] Render', content);
        let elItems = [];
        let dataType = subtotalsMap.dataType;
        let subTotalItems = subtotalsMap.items;
        let categoryMaster = subtotalsMap.categoryMaster;

        for (var key in subTotalItems) {
            if (!Object.prototype.hasOwnProperty.call(subTotalItems, key)) {
                continue;
            }
            let color= null;
            let displayKey = null;
            if (dataType === 'category') {
                color = getCategoryColor(key);
                displayKey = categoryMaster[key];
            }
            else {
                color = mapYearColors[key];
                displayKey = key;
            }
            elItems.push(<div className="tooltipItemContainer" key={`tooltipItem-${key}`}>
                <div className="tooltipCell tooltipYearColor" style={{backgroundColor: `${color}`}}/>
                <div className="tooltipCell tooltipYear">{displayKey}:</div>
                <div className="tooltipCell tooltipCost">{formatMoney(subTotalItems[key])}</div>
            </div>);
        }
        return <div>
            {elItems}
        </div>
    }}
      
  />
}



export const prepareBody = (table, entityType) => {

    
    const prepareCostBarCell = (cell, row) => {
        let cellClass = 'tdCostBar ';
        if (entityType === EntityTypes.district || entityType === EntityTypes.region 
            || entityType === EntityTypes.fundSource || entityType === EntityTypes.contractor
            || entityType === EntityTypes.category) {                
            // Stacked Bar Chart
            // We put all the stackedbarChart logic here and avoid doing the rendering inside the columnDef cell render because the react-tooltip has intermittent issues when user clicks Sort
            if (entityType === EntityTypes.contractor) {
                cellClass = 'tdCostBarStandalone';
            }
            else {
                cellClass += ' tdCostBarFullWidth';
            }
            
            let {entityGroups, minCost, maxCost, checkedStretch} = table.getState();
            const currEntity = row.getValue(entityType);
            const findEntity = entityGroups.find(grp => grp[entityType] === currEntity);
            if (!findEntity) {
                console.error('[prepareCostBarCell] Unable to find entity', currEntity);
                return;
            }
            const yearSubtotalsTooltip = {
                dataType: 'year', 
                items: findEntity.yearSubTotals,
            };
            
            return <td key={cell.id} className={cellClass}>
                <div
                data-tooltip-id="chart-tooltip"
                data-tooltip-content={JSON.stringify(yearSubtotalsTooltip)}
                >                        
                <StackedBarChart name={currEntity} subtotalsMap={findEntity.yearSubTotals} minCost={minCost} maxCost={maxCost} stretchToFullWidth={checkedStretch}/>
                </div>                
            </td>
        }
        if (entityType === EntityTypes.year) {
            cellClass += ' tdCostBarFullWidth';
        }
        // else: just a normal bar chart (e.g. project/year view)
        return <td key={cell.id} className={cellClass}>
                    <div>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>                
                </td>
    }

    const prepareCategoryBarCell = (cell, row) => {
        let cellClass = 'tdCostBar ';
         
        // Stacked Bar Chart
        // We put all the stackedbarChart logic here and avoid doing the rendering inside the columnDef cell render because the react-tooltip has intermittent issues when user clicks Sort
        //cellClass += ' tdCostBarFullWidth';        
        
        let {entityGroups, minCost, maxCost, categoryMaster, checkedStretch} = table.getState();
        const currEntity = row.getValue(entityType);
        const findEntity = entityGroups.find(grp => grp[entityType] === currEntity);
        if (!findEntity) {
            console.error('[prepareCostBarCell] Unable to find entity', currEntity);
            return;
        }
        const categorySubTotalsTooltip = {
            dataType: 'category', 
            items: findEntity.categorySubTotals,
            categoryMaster: categoryMaster
        };            

        return <td key={cell.id} className={cellClass}>
            <div
                data-tooltip-id="chart-tooltip"
                data-tooltip-content={JSON.stringify(categorySubTotalsTooltip)}
                >   
            <StackedBarChart name={currEntity} subtotalsMap={findEntity.categorySubTotals} minCost={minCost} maxCost={maxCost} dataType='category' stretchToFullWidth={checkedStretch}/>
            </div> 
        </td>        
    }

    const prepareNormalCell = (cell) => {
        let cellClass = 'tdTable';
        const cellColId = cell.column.id;
        let styles={};
        if (cellColId === 'p' || cellColId === 'subtotal') {
            cellClass = 'tdCost';
            if (entityType === EntityTypes.contractor) {
                styles.width = `${1/7.0*100}%`
            }
        }
        else {
            if (entityType === EntityTypes.contractor) {
                styles.width = `${2/7.0*100}%`
            }
        }

        if (entityType === EntityTypes.district || entityType === EntityTypes.region || entityType === EntityTypes.year 
            || entityType === EntityTypes.fundSource || entityType === EntityTypes.category
        ) {
            cellClass += ' tdSummary';
        }                

        return <td key={cell.id} className={cellClass} style={styles}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
    }

    const prepareStatusCell = (cell, row) => {
        let cellClass = 'tdTable tdStatus';
        const {masterData} = table.getState();
        const statusVal = row.getValue('sts');
        const statusStr = getMasterDataValue(masterData, EntityTypes.status, statusVal)
        const statusColor = statusColorMap[statusStr];
        
        return <td key={cell.id} className={cellClass} style={{backgroundColor: statusColor}}>
                {statusStr}
                </td>
    }

    const prepareCells = (row) => {
        let retCells = row.getVisibleCells().map(cell => {
            const cellColId = cell.column.id;
            if (cellColId === 'CostBar' || cellColId === 'CostBarYear') {
                return prepareCostBarCell(cell, row)
            }
            if (cellColId === 'sts') {
                return prepareStatusCell(cell, row)
            }
            if (cellColId === 'CostBarCategory') {
                return prepareCategoryBarCell(cell, row)
            }
            return prepareNormalCell(cell);
        });

        return retCells;
    }

    const rows = table.getRowModel().rows;
    const ret = rows.map(row => {
        return <tr key={row.id}>
            {prepareCells(row)}
        </tr>
    })
    //console.log('rows', ret)
    return ret;
}

const getSortingIcon = (isSorted) => {        
    const iconLookup = iconSortLookup[isSorted];
    if (!iconLookup) {
        return <i className="bx bxs-sort-alt table-icon table-icon-disabled"></i>
    }
    const iconClass = `${iconLookup} table-icon table-icon-enabled`;

    return <i className={iconClass}></i>;
}

export const prepareHeader = (table, entityType) => {
    const headerGroups = table.getHeaderGroups();
    const setLoadingMsg = table.getState()?.setLoadingMsg;
    let headerColumns = [];
    
    headerGroups.forEach(hdrGrp => {
        hdrGrp.headers.forEach(header => {
            let colHeader = header.column.columnDef.header;
            if (colHeader === 'CostBar') {
                return;
            }
            const isSortable = header.column.getCanSort();
            let thClassNames = 'thTable';
            if (isSortable) {
                thClassNames += ' thSortable'
            }
            let colSpan = colHeader === 'Cost' && entityType != EntityTypes.contractor ? 2 : 1;            
            headerColumns.push(<th key={header.id} className={thClassNames} 
                onClick={ () => {
                    if (!isSortable) {
                        return;
                    }
                    setLoadingMsg(`Sorting Table by ${colHeader}...`);
                        setTimeout(() => {                            
                            header.column.toggleSorting();             
                            setLoadingMsg(null);
                          }, 0);
                    }                   
                }
                // style={{width: '33.33%'}}
                colSpan={colSpan}>
                {colHeader}
                {isSortable && getSortingIcon(header.column.getIsSorted())}                
            </th>);
        });
    })

    return <tr>
        {headerColumns}
    </tr>;
}

export const showGrandTotalDirectly = (grandTotal) => {
    return <div className="grandTotalContainer">
        <div className="grandTotalLabel">SUBTOTAL:</div>
        <div className="grandTotalValue">{formatMoney(grandTotal)}</div>
    </div>;
}

export const preparePagninator = (table) => {
    let totalFiltered = table.getFilteredRowModel().rows.length;
    let currPageIndex = table.getState().pagination.pageIndex;
    let firstRecordIndex = totalFiltered == 0 ? 0 : currPageIndex * table.getState().pagination.pageSize + 1;
    let lastRecordIndex = (currPageIndex + 1) * table.getState().pagination.pageSize;        
    let isInFirstPage = currPageIndex === 0;
    if (lastRecordIndex > totalFiltered) {
        lastRecordIndex = totalFiltered;
    }
    let isInLastPage = lastRecordIndex >= totalFiltered;
    return <div className="paginator">
            <div className='currPage'>Showing {firstRecordIndex} - {lastRecordIndex} of {formatNumber(totalFiltered)} </div>
            <select
                className='pageSizeSelector'
                value={table.getState().pagination.pageSize}
                onChange={e => {
                    table.setPageSize(Number(e.target.value))
                }}
                >
                {[10, 20, 50, 100, 250].map(pageSize => (
                    <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                    </option>
                ))}
            </select>
            <div className='pageNavBtns'>
                <i className={`navBtn bx bx-first-page ${isInFirstPage ? 'btnDisabled': 'btnEnabled' }`} 
                    onClick={()=>table.firstPage()}
                    title="Go to First Page"></i>

                <i className={`navBtn bx bx-chevron-left ${isInFirstPage ? 'btnDisabled': 'btnEnabled' }`} 
                    onClick={()=>table.previousPage()}
                    title="Go to Previous Page"></i>
                
                {/* TODO dropdown to page number*/}

                <i className={`navBtn bx bx-chevron-right ${isInLastPage ? 'btnDisabled': 'btnEnabled' }`} 
                    onClick={()=>table.nextPage()}
                    title="Go to Next Page"></i>

                <i className={`navBtn bx bx-last-page ${isInLastPage ? 'btnDisabled': 'btnEnabled' }`} 
                    onClick={()=>table.lastPage()}
                    title="Go to Last Page"></i>
            </div>
        </div>
}

/* Filter re-render issue: Each time filter changes, there will be 3 re-renders (expected: 2)
 * 1st: Due to redux (No change in UI)
        useEffect will detect change in redux, so will call setColumnFilters()
 * 2nd & 3rd: Due to calling setColumnFilters(). Ideally 1 re-render only, not 2. Maybe react-table bug.
 */

export const TableBase = () => {
    // Redux values (global-values)
    // TODO: Do not select entire reducer to avoid unnecessary re-render while simply showing loader icon.
    const dataState = useSelector(state => state.dataReducer);
    const [loadingMsg, setLoadingMsg] = useState(null);
    const tableRef = useRef();
    
    console.log('[TableBase] render, dataState:', dataState);    
    
    // Choose table to return
    if (dataState.Grouping === '' || dataState.Grouping === 'Project') {
        return <>
            {loadingMsg && <LoadingIndicator isOverlay={true} refTable={tableRef} msg={loadingMsg}/>}            
            <div className="tableContainer" ref={tableRef}>
                <TableByProject dataState={dataState} setLoadingMsg={setLoadingMsg}/>
            </div>
        </>
    }

    if (dataState.Grouping === 'Year') {
        return <>
            {loadingMsg && <LoadingIndicator isOverlay={true} refTable={tableRef} msg={loadingMsg}/>}
            <div className="tableContainer" ref={tableRef}>
                <TableByYear dataState={dataState} setLoadingMsg={setLoadingMsg}/>
            </div>
        </>
    }

    if (dataState.Grouping === 'Region') {
        return <>
            {loadingMsg && <LoadingIndicator isOverlay={true} refTable={tableRef} msg={loadingMsg}/>}
            <div className="tableContainer" ref={tableRef}>
                <TableByRegion dataState={dataState} setLoadingMsg={setLoadingMsg}/>
            </div>
        </>
    }

    if (dataState.Grouping === 'District') {
        return <>
            {loadingMsg && <LoadingIndicator isOverlay={true} refTable={tableRef} msg={loadingMsg}/>}
            <div className="tableContainer" ref={tableRef}>
                <TableByDistrict dataState={dataState} setLoadingMsg={setLoadingMsg}/>
            </div>
        </>
    }
    
    if (dataState.Grouping === 'Fund Source') {
        return <>
            {loadingMsg && <LoadingIndicator isOverlay={true} refTable={tableRef} msg={loadingMsg}/>}
            <div className="tableContainer" ref={tableRef}>
                <TableByFundSrc dataState={dataState} setLoadingMsg={setLoadingMsg}/>
            </div>
        </>
    }

    if (dataState.Grouping === 'Contractor') {
        return <>
            {loadingMsg && <LoadingIndicator isOverlay={true} refTable={tableRef} msg={loadingMsg}/>}
            <div className="tableContainer" ref={tableRef}>
                <TableByContractor dataState={dataState} setLoadingMsg={setLoadingMsg}/>
            </div>
        </>
    }

    if (dataState.Grouping === 'Category') {
        return <>
            {loadingMsg && <LoadingIndicator isOverlay={true} refTable={tableRef} msg={loadingMsg}/>}
            <div className="tableContainer" ref={tableRef}>
                <TableByCategory dataState={dataState} setLoadingMsg={setLoadingMsg}/>
            </div>
        </>
    }
}