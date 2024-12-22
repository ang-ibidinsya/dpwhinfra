import './settings.css';
import { useForm, Controller } from 'react-hook-form';
import { useEffect } from 'react';
import { useDispatch, useSelector} from 'react-redux';
import Select, {createFilter} from 'react-select';
import AsyncSelect from 'react-select/async';
import {setSettings} from '../state/data/dataSlice';
import {uniqueYears} from './filterItems';
import {CustomOption} from './customOption';
import { filterOptions } from '../util';


// Needed by React Select
const formatComboOptions = (uniqValues) => {
    return uniqValues.map((v, i, arr) => {
        return {value: v, label: v}
    });
}

const formatMasterDataComboOptions = (uniqValues) => {
    let ret = [];
    if (!uniqValues) {
        return ret;
    }
    for (var key in uniqValues) {
        if (!uniqValues.hasOwnProperty(key)) continue;
        ret.push({value: key, label: uniqValues[key]});
    }

    return ret.sort((a, b) => (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0));
}

export const Settings = () => {
    // Note: calling watch here (not inside useEffect) will cause this for to re-render each time a watched value changes (not good)
    console.log('[Settings render]');
    const {register, handleSubmit, watch, control} = useForm();

    // redux values
    
    const dispatch = useDispatch();
    const dataState = useSelector(state => state.dataReducer);

    const uniqueRegions = dataState?.MasterData?.RegionMaster;
    const uniqueDistricts = dataState?.MasterData?.DistrictMaster;
    const uniqueContractors = dataState?.MasterData?.ContractorMaster;
    const uniqueStatuses = dataState?.MasterData?.StatusMaster;
    const uniqueSourceOfFunds = dataState?.MasterData?.SourceMaster;

    //debugger

    const comboOptions = {
        Year: formatComboOptions(uniqueYears),
        Region: formatMasterDataComboOptions(uniqueRegions),
        District: formatMasterDataComboOptions(uniqueDistricts),
        Contractor: formatMasterDataComboOptions(uniqueContractors),
        Status: formatMasterDataComboOptions(uniqueStatuses),
        "Fund Source": formatMasterDataComboOptions(uniqueSourceOfFunds)
    }

    const createFilterField = (fieldName, fieldType, options) => {
        const customStylesSelect = {
            container: provided => ({
              ...provided,
              width: '100%',
            }),
            control: base => ({
                ...base,
                border: '1px solid black',
                boxShadow: '1px solid black',
                "&:hover": {
                    border: "1px solid #054bfc",
                    cursor: 'text'
                },                
            }),
            multiValue: (styles, { data }) => {                
                return {
                  ...styles,
                  backgroundColor: '#c9e2f5',
                };
            }
        };

        const customComponents = {};
        if (options?.largeCombo) {
            //customComponents.MenuList = CustomMenuList;
            //customComponents.Option = CustomOption;
        }
        let inputElem = null;
        if (fieldType === 'text') {
            inputElem = <input {...register(fieldName)} type="text" className="fieldText"></input>;
        }
        else if (options?.largeCombo) {
            const allOptions = comboOptions[fieldName];
            const defaultOptions = allOptions.slice(0, 100);
            defaultOptions.push({label: `Only 100 out of ${allOptions.length} contractors shown. Type a filter to find more contractors.`, value: null, isDisabled: true});
            const loadOptions = (inputValue) => {
                return new Promise((resolve) => {
                    setTimeout(() => {                        
                        // Filter options based on the input value (case-insensitive)
                        const filteredOptions = filterOptions(allOptions, inputValue, 100); // Show a max of 100 items
                        filteredOptions.push({label: 'Max of 100 contractors shown. Type a more specific filter to find more contractors.', value: null, isDisabled: true});
                        resolve(filteredOptions);
                    }, 0);
                });
            };              

            // filter options asynchronously because the list is really big. Did not work/not feasible: use of react-window because item height is 
            inputElem = <Controller
            name={fieldName}
            control={control}
            defaultValue=""
            render = {({ field}) => (
                <AsyncSelect {...field} 
                    className="fieldSelect"
                    loadOptions={loadOptions}
                    defaultOptions={defaultOptions}
                    styles={customStylesSelect}
                    isMulti={true}
                    closeMenuOnSelect={false}
                    placeholder={`Select ${fieldName}...`}
                    components={customComponents}
                />
            )}
            />;
        }
        else
        {
            inputElem = <Controller
            name={fieldName}
            control={control}
            defaultValue=""
            render = {({ field}) => (
                <Select {...field} 
                    className="fieldSelect"
                    options={comboOptions[fieldName]}
                    styles={customStylesSelect}
                    isMulti={true}
                    closeMenuOnSelect={false}
                    placeholder={`Select ${fieldName}...`}
                    components={customComponents}
                />
            )}
            />;
        }
            
        let fieldInputClassName = 'fieldInput';
        if (options?.largeCombo) {
            fieldInputClassName += ' fieldInput-large';
        }

        return <>
            <div className="fieldLabel">
                {fieldName}:
            </div>
            <div className={fieldInputClassName}>                
                {inputElem}
            </div>
        </>
    }

    const formMain = <form className="mainForm">
        <div className="collapsibleContainerText">
            <i className="bx bxs-cog"></i>
            <span>Settings</span>
        </div>
        {/* Filter */}
        <div className="groupForm">
            <div className="groupLabel">
                <i className="bx bxs-filter-alt"></i> Filters
            </div>
            <div className="fieldTable">
            {createFilterField('Year', 'combo')}
            {createFilterField('Region', 'combo')}
            {createFilterField('District', 'combo')}
            {createFilterField('Project', 'text')}
            {createFilterField('Status', 'combo')}
            {createFilterField('Fund Source', 'combo')}
            {createFilterField('Contractor', 'combo', {largeCombo: true})}
            </div>
        </div>
    {/* Gouping */}
    <div className="groupForm">
            <div className="groupLabel">
                <i className="bx bx-merge"></i> View By / Grouping
            </div>
        </div>
        
    </form>
    return formMain;
}