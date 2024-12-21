import { createSlice } from "@reduxjs/toolkit";

const mapAndFilterData = (filters) => {
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

        ret.overallProjMaxCost = Math.max(ret.overallProjMaxCost, currData.Cost);
        ret.overallProjMinCost = Math.min(ret.overallProjMinCost, currData.Cost);

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
        unFilteredYearMap[currYear].subtotal += currData.Cost;

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
        unFilteredRegionMap[currRegion].subtotal += currData.Cost;

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
        unFilteredDistrictMap[currDistrict].subtotal += currData.Cost;

        if (bSatisfiesFilter) {
            mapYearGroups[currYear].items.push(currData);
            mapYearGroups[currYear].subtotal += currData.Cost;

            mapRegionGroups[currRegion].items.push(currData);
            mapRegionGroups[currRegion].subtotal += currData.Cost;
            mapRegionGroups[currRegion].yearSubTotals[currData.Year] = (mapRegionGroups[currRegion].yearSubTotals[currData.Year] || 0 ) + currData.Cost;

            mapDistrictGroups[currDistrict].items.push(currData);
            mapDistrictGroups[currDistrict].subtotal += currData.Cost;
            mapDistrictGroups[currDistrict].yearSubTotals[currData.Year] = (mapDistrictGroups[currDistrict].yearSubTotals[currData.Year] || 0 ) + currData.Cost;

            ret.grandTotal += currData.Cost;
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
    FilteredData: null
};

const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        setSettings: (state, action) => {
            console.log('[settings reducer][setSettings] state:', state, 'action:', action);
            Object.assign(state, action.payload);
            Object.assign(state.Filters, action.payload.Filters);
            Object.assign(state.FilteredData, mapAndFilterData(action.payload.Filters))
        },
        setInitialData: (state, action) => {
            console.log('[settings reducer][setInitialData] state:', state, 'action:', action);
            Object.assign(state.AllData, action.payload.constractsJson);
            Object.assign(state.MasterData, action.payload.masterDataJson);
        }
    }
})

export const {setSettings, setInitialData} = dataSlice.actions;
export const dataReducer = dataSlice.reducer;