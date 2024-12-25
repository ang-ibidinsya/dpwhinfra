import { createSlice } from "@reduxjs/toolkit";

const satisfiesFilter = (currData, filters) => {
    if (!filters) {
        return true;
    }

    // [1] year
    if (filters.Year?.length > 0 && !filters.Year.includes(currData.yr)) {
        return false;
    }
    // [2] Region
    if (filters.Region?.length > 0 && !filters.Region.includes(currData.rgn)) {
        return false;
    }
    // [3] District
    if (filters.District?.length > 0 && !filters.District.includes(currData.dst)) {
        return false;
    }
    // [4] Item Name (case insensitive)
    if (filters.Project && currData.dsc.toUpperCase().indexOf(filters.Project.toUpperCase()) < 0) {
        return false;
    }

    // [5] Status
    if (filters.Status?.length > 0 && !filters.Status.includes(currData.sts)) {
        return false;
    }

    // [6] Fund Source
    if (filters.FundSource?.length > 0 && !filters.FundSource.includes(currData.src)) {
        return false;
    }

    // [7] Contractor
    if (filters.Contractor?.length > 0 && !filters.Contractor.includes(currData.src)) {
        return false;
    }

    return true;
}

const mapAndFilterData = (data, filters) => {
    let mapYearGroups = {};
    let mapRegionGroups = {};
    let mapDistrictGroups = {};

    let ret = {
        yearGroups: {},
        regionGroups: {},
        districtGroups: {},
        grandTotal: 0, // filtered Grandtotal
        // not affected by filter
        overallProjMaxCost: 0, 
        overallProjMinCost: Number.MAX_VALUE, 
        overallYearMaxCost: 0,
        overallYearMinCost: Number.MAX_VALUE,
        overallRegionMaxCost: 0,
        overallRegionMinCost: Number.MAX_VALUE,
        overallDistrictMaxCost: 0,
        overallDistrictMinCost: Number.MAX_VALUE,
    }
    if (!data) {
        return ret;
    }

    // Optimization TODO: Do not re-compute unfiltered items each time
    let unFilteredYearMap = {};
    let unFilteredRegionMap = {};
    let unFilteredDistrictMap = {};
    // use for instead of forEach
    for (let i = 0; i < data.length; i++) {        
        let currData = data[i];
        let currYear = currData.Year;
        let currRegion = currData.Region;
        let currDistrict = currData.District;

        ret.overallProjMaxCost = Math.max(ret.overallProjMaxCost, currData.p);
        ret.overallProjMinCost = Math.min(ret.overallProjMinCost, currData.p);

        let bSatisfiesFilter = satisfiesFilter(currData, filters);
        
        // [a] year
        if (!mapYearGroups[currYear]) {
            mapYearGroups[currYear] = {    
                items:[], 
                subtotal: 0,
                year: currYear                
            };
        }
        if (!unFilteredYearMap[currYear]) {
            unFilteredYearMap[currYear] = {
                subtotal: 0
            }
        }
        unFilteredYearMap[currYear].subtotal += currData.p;

        // [b] region
        if (!mapRegionGroups[currRegion]) {
            mapRegionGroups[currRegion] = {
                items:[], 
                subtotal: 0,
                region: currRegion,
                yearSubTotals: {}
            };
        }
        if (!unFilteredRegionMap[currRegion]) {
            unFilteredRegionMap[currRegion] = {
                subtotal: 0
            }
        }
        unFilteredRegionMap[currRegion].subtotal += currData.p;

        // [c] district
        if (!mapDistrictGroups[currDistrict]) {
            mapDistrictGroups[currDistrict] = {
                items:[], 
                subtotal: 0,
                district: currDistrict,
                yearSubTotals: {}
            };
        }
        if (!unFilteredDistrictMap[currDistrict]) {
            unFilteredDistrictMap[currDistrict] = {
                subtotal: 0
            }
        }
        unFilteredDistrictMap[currDistrict].subtotal += currData.p;

        if (bSatisfiesFilter) {
            //mapYearGroups[currYear].items.push(currData);
            mapYearGroups[currYear].subtotal += currData.p;

            //mapRegionGroups[currRegion].items.push(currData);
            mapRegionGroups[currRegion].subtotal += currData.p;
            mapRegionGroups[currRegion].yearSubTotals[currData.Year] = (mapRegionGroups[currRegion].yearSubTotals[currData.Year] || 0 ) + currData.p;

            //mapDistrictGroups[currDistrict].items.push(currData);
            mapDistrictGroups[currDistrict].subtotal += currData.p;
            mapDistrictGroups[currDistrict].yearSubTotals[currData.Year] = (mapDistrictGroups[currDistrict].yearSubTotals[currData.Year] || 0 ) + currData.p;

            ret.grandTotal += currData.p;
        }
    }

    const unfilteredYearData = Object.values(unFilteredYearMap).map (y => y.subtotal);
    const unfilteredRegionData = Object.values(unFilteredRegionMap).map (y => y.subtotal);
    const unfilteredDistrictData = Object.values(unFilteredDistrictMap).map (y => y.subtotal);
    ret.overallYearMaxCost = Math.max(...unfilteredYearData);
    ret.overallYearMinCost = Math.min(...unfilteredYearData);
    ret.overallRegionMaxCost = Math.max(...unfilteredRegionData);
    ret.overallRegionMinCost = Math.min(...unfilteredRegionData);
    ret.overallDistrictMaxCost = Math.max(...unfilteredDistrictData);
    ret.overallDistrictMinCost = Math.min(...unfilteredDistrictData);

    ret.yearGroups = Object.values(mapYearGroups);
    ret.regionGroups = Object.values(mapRegionGroups);
    ret.districtGroups = Object.values(mapDistrictGroups);

    console.log('[mapAndFilterData] ret', ret);
    return ret;
}

// For both filters and groupings
const initialState = {
    // Main Data and MasterData
    AllData: [],
    MasterData: {},

    // Filters
    Filters: {
        Year: [],
        Region: [],
        District: [],
        Project: '',    
        Contractor: [],        
    },

    // Groupings    
    Grouping: '',
    /*
    FilteredData: {
        GrandTotal: 0,
        YearlyGroups: {},
        RegionGroups: {},
        DistrictGroups: {},
        ContractorGroups: {}
    }
    */
    FilteredData: mapAndFilterData(null, null)
};

const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        setSettings: (state, action) => {
            console.log('[settings reducer][setSettings] Start action:', action);
            Object.assign(state, action.payload);
            Object.assign(state.Filters, action.payload.Filters);
            Object.assign(state.FilteredData, mapAndFilterData(state.AllData, action.payload.Filters))
            console.log('[settings reducer][setSettings] Finished action:', action);
        },
        setInitialData: (state, action) => {
            console.log('[settings reducer][setInitialData] action:', action);
            Object.assign(state.AllData, action.payload.constractsJson);
            Object.assign(state.MasterData, action.payload.masterDataJson);
            Object.assign(state.FilteredData, mapAndFilterData(state.AllData, null))
        }
    }
})

export const {setSettings, setInitialData} = dataSlice.actions;
export const dataReducer = dataSlice.reducer;