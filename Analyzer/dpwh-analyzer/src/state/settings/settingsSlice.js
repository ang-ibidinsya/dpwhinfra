// For other settings that do not have impact to the data
import { createSlice } from "@reduxjs/toolkit";
import { getDefaultColVisibility } from '../../components/table-project';

const initialState = {
    projectSelectedColumns: {
        yr: true,
        frm: false,
        to: false,
        rgn: true,
        dst: true,
        dsc: true,
        ctr: true,
        src: false,
        cId: false,
        sts: true,
        pct: false,
        p: true,        
    },
}

const convertSelectColumnsList = (selColsList, stateColSettings) => {
    // Unable to iterate through properties of state; seems like they are being dynamically generated
    // Just prepare the new state from the calling function
    /*
    for(let key in stateColSettings) {
        if (!stateColSettings.hasOwnProperty(key)) continue;
        stateColSettings[key] = selColsList.includes(key);
    }
    */
}

const settingsSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        setColumnSettings: (state, action) => {
            debugger
            //convertSelectColumnsList(action.payload, state.projectSelectedColumns);
            state.projectSelectedColumns = action.payload;
            console.log('[settingsSlice][setColumnSettings] new state ', state.projectSelectedColumns);
        }
    }
});

export const {setColumnSettings} = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;