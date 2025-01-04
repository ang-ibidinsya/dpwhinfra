import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

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
    if (filters.Contractor?.length > 0) {
        let currCtorsList = currData.ctr;
        let ret = filters.Contractor.some(filter => currCtorsList.includes(filter));
        return ret;
    }

    return true;
}

const mapAndFilterData = (data, filters) => {
    let mapYearGroups = {};
    let mapRegionGroups = {};
    let mapDistrictGroups = {};
    let mapFundSourceGroups = {};
    let mapContractorGroups = {};

    let ret = {
        yearGroups: {},
        regionGroups: {},
        districtGroups: {},
        fundSrcGroups: {},
        contractorGroups: {},
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
        overallFundSourceMaxCost: 0,
        overallFundSourceMinCost: Number.MAX_VALUE,
        overallContractorMaxCost: 0,
        overallContractorMinCost: Number.MAX_VALUE,        
    }
    if (!data) {
        return ret;
    }

    // Optimization TODO: Do not re-compute unfiltered items each time
    let unFilteredYearMap = {};
    let unFilteredRegionMap = {};
    let unFilteredDistrictMap = {};
    let unFilteredFundSrcMap = {};
    let unFilteredContractorMap = {};
    // use for instead of forEach
    for (let i = 0; i < data.length; i++) {        
        let currData = data[i];
        let currYear = currData.yr;
        let currRegion = currData.rgn;
        let currDistrict = currData.dst;
        let currFundSource = currData.src;
        let currContractorList = currData.ctr;

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

        // [d] Fund Source
        if (!mapFundSourceGroups[currFundSource]) {
            mapFundSourceGroups[currFundSource] = {
                items:[], 
                subtotal: 0,
                fundSource: currFundSource,
                yearSubTotals: {}
            };
        }
        if (!unFilteredFundSrcMap[currFundSource]) {
            unFilteredFundSrcMap[currFundSource] = {
                subtotal: 0
            }
        }
        unFilteredFundSrcMap[currFundSource].subtotal += currData.p;

        // [e] Contractors             
        for (let iXtor = 0; iXtor < currContractorList.length; iXtor++) {
            let currContractor = currContractorList[iXtor];
            if (!mapContractorGroups[currContractor]) {
                mapContractorGroups[currContractor] = {
                    items:[], 
                    subtotal: 0,
                    contractor: currContractor,
                    yearSubTotals: {}
                };
            }
            if (!unFilteredContractorMap[currContractor]) {
                unFilteredContractorMap[currContractor] = {
                    subtotal: 0
                }
            }
            unFilteredContractorMap[currContractor].subtotal += currData.p;
        }

        if (bSatisfiesFilter) {
            //mapYearGroups[currYear].items.push(currData);
            mapYearGroups[currYear].subtotal += currData.p;

            //mapRegionGroups[currRegion].items.push(currData);
            mapRegionGroups[currRegion].subtotal += currData.p;
            mapRegionGroups[currRegion].yearSubTotals[currData.yr] = (mapRegionGroups[currRegion].yearSubTotals[currData.yr] || 0 ) + currData.p;

            //mapDistrictGroups[currDistrict].items.push(currData);
            mapDistrictGroups[currDistrict].subtotal += currData.p;
            mapDistrictGroups[currDistrict].yearSubTotals[currData.yr] = (mapDistrictGroups[currDistrict].yearSubTotals[currData.yr] || 0 ) + currData.p;

            mapFundSourceGroups[currFundSource].subtotal += currData.p;
            mapFundSourceGroups[currFundSource].yearSubTotals[currData.yr] = (mapFundSourceGroups[currFundSource].yearSubTotals[currData.yr] || 0 ) + currData.p;

            for (let iXtor = 0; iXtor < currContractorList.length; iXtor++) {
                let currContractor = currContractorList[iXtor];
                mapContractorGroups[currContractor].subtotal += currData.p;
                mapContractorGroups[currContractor].yearSubTotals[currData.yr] = (mapContractorGroups[currContractor].yearSubTotals[currData.yr] || 0 ) + currData.p;
            }

            ret.grandTotal += currData.p;
        }
    }

    const unfilteredYearData = Object.values(unFilteredYearMap).map (y => y.subtotal);
    const unfilteredRegionData = Object.values(unFilteredRegionMap).map (y => y.subtotal);
    const unfilteredDistrictData = Object.values(unFilteredDistrictMap).map (y => y.subtotal);
    const unfilteredFundSrcData = Object.values(unFilteredFundSrcMap).map (y => y.subtotal);
    const unfilteredContractorData = Object.values(unFilteredContractorMap).map (y => y.subtotal);
    ret.overallYearMaxCost = Math.max(...unfilteredYearData);
    ret.overallYearMinCost = Math.min(...unfilteredYearData);
    ret.overallRegionMaxCost = Math.max(...unfilteredRegionData);
    ret.overallRegionMinCost = Math.min(...unfilteredRegionData);
    ret.overallDistrictMaxCost = Math.max(...unfilteredDistrictData);
    ret.overallDistrictMinCost = Math.min(...unfilteredDistrictData);
    ret.overallFundSourceMaxCost = Math.max(...unfilteredFundSrcData);
    ret.overallFundSourceMinCost = Math.min(...unfilteredFundSrcData);
    ret.overallContractorMaxCost = Math.max(...unfilteredContractorData);
    ret.overallContractorMinCost = Math.min(...unfilteredContractorData);

    ret.yearGroups = Object.values(mapYearGroups);
    ret.regionGroups = Object.values(mapRegionGroups);
    ret.districtGroups = Object.values(mapDistrictGroups);
    ret.fundSrcGroups = Object.values(mapFundSourceGroups);
    ret.contractorGroups = Object.values(mapContractorGroups);

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
    FilteredData: mapAndFilterData(null, null),
    FilterLoadingMsg: null,
    dummy: null
};

const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        setSettings: (state, action) => { // TODO: rename as setFilters
            console.log('[data reducer][setSettings] Start action:', action);
            Object.assign(state, action.payload);
            Object.assign(state.Filters, action.payload.Filters);
            Object.assign(state.FilteredData, mapAndFilterData(state.AllData, action.payload.Filters))
            console.log('[data reducer][setSettings] Finished action:', action);
        },
        setInitialData: (state, action) => {
            console.log('[settings reducer][setInitialData] action:', action);
            Object.assign(state.AllData, action.payload.constractsJson);
            Object.assign(state.MasterData, action.payload.masterDataJson);
            Object.assign(state.FilteredData, mapAndFilterData(state.AllData, null))
        }
    },
    // For handling async actions
    extraReducers: (builder) => {
        builder
        .addCase(doHeavTaskAsync.pending, (state) => {
            console.log('doHeavTaskAsync.pending');
            state.FilterLoadingMsg = 'Applying Filter...';
        })
        .addCase(doHeavTaskAsync.fulfilled, (state,action) => {            
            console.log('doHeavTaskAsync.fulfilled');
            state.FilterLoadingMsg = null;
        })
        .addCase(setSettingsAsync.pending, (state) => {
            console.log('setSettingsAsync.pending');                        
            //state.FilterLoadingMsg = 'Applying Filter...'; // Uncomment to show spinner (we hide it now because filtering seems very fast done asynchronously)
            // TODO: Overall, it becomes slow if there is column sorting applied. This async function finishes fast, so spinner is gone quickly.
            // But the table rendering is slow because it still needs to sort data. Need to move the spinner to somewhere else.
        })
        .addCase(setSettingsAsync.fulfilled, (state, action) => {            
            console.log('setSettingsAsync.fulfilled');
            state.Filters = action.payload.Filters;
            state.FilteredData = action.payload.FilteredData;
            state.Grouping = action.payload.Grouping;
            //state.FilterLoadingMsg = null;// Uncomment to show spinner (we hide it now because filtering seems very fast done asynchronously)
        })
    }
});

// For studying  only
export const doHeavTaskAsync = createAsyncThunk(
    'data/doHeavTaskAsync',
    async(payload, thunkAPI) => {
        let origState = thunkAPI.getState();
        await new Promise((resolve => setTimeout(resolve, 2000)));
        return 123;
    }
);

export const setSettingsAsync = createAsyncThunk(
    'data/setSettingsAsync',
    async(payload, thunkAPI) => {
        console.log('[setSettingsAsync] payload', payload);
        let origState = thunkAPI.getState();
        const updatedState = await new Promise((resolve => {
            const updatedFilteredData = mapAndFilterData(origState.dataReducer.AllData, payload.Filters);
            resolve({
                Filters: payload.Filters,
                FilteredData: updatedFilteredData,
                Grouping: payload.Grouping
            });
        }));
        return updatedState;
    }
);

export const {setSettings, setInitialData} = dataSlice.actions;
export const dataReducer = dataSlice.reducer;