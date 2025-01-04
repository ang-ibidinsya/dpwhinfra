import { configureStore } from "@reduxjs/toolkit";
import { dataReducer } from './data/dataSlice';
import { settingsReducer } from './settings/settingsSlice';

export const store = configureStore({
    reducer: {
        dataReducer: dataReducer,
        settingsReducer: settingsReducer
    }
});
