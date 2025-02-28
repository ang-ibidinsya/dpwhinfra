import './settings.css';
import { useForm, Controller } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector} from 'react-redux';
import Select, {createFilter} from 'react-select';
import AsyncSelect from 'react-select/async';
import {setSettings, doHeavTaskAsync, setSettingsAsync} from '../state/data/dataSlice';
import {uniqueYears} from './filterItems';
import { filterOptions } from '../util';
import {DebouncedTextField} from '../controls/debouncedTextField';
import {getCategoryTooltipMessage, getDistrictTooltipMessage, getProjectTooltipMessage} from '../controls/controlUtils';
import {CustomMenuWithDescription} from '../controls/customMenuWithDescription';
import { categoryLabelMap } from '../controls/controlUtils';

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

const formatCategoryComboOptions = (uniqValues) => {
    let ret = [];
    if (!uniqValues) {
        return ret;
    }
    for (var key in uniqValues) {
        if (!uniqValues.hasOwnProperty(key)) continue;
        ret.push({value: key, label: uniqValues[key], subtitle: categoryLabelMap[uniqValues[key]]});
    }

    return ret.sort((a, b) => (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0));
}


export const Settings = () => {
    // Note: calling watch here (not inside useEffect) will cause this for to re-render each time a watched value changes (not good)
    console.log('[Settings render]');
    const {register, watch, control} = useForm();

    // redux values    
    const dataStateMasterData = useSelector(state => state.dataReducer?.MasterData);
    const uniqueRegions = dataStateMasterData?.RegionMaster;
    const uniqueDistricts = dataStateMasterData?.DistrictMaster;
    const uniqueContractors = dataStateMasterData?.ContractorMaster;
    const uniqueStatuses = dataStateMasterData?.StatusMaster;
    const uniqueSourceOfFunds = dataStateMasterData?.SourceMaster;
    const uniqueCategories = dataStateMasterData?.CategoryMaster;
    
    // redux dispatch-related
    const dispatch = useDispatch();

    // Purpose: for firing redux action
    useEffect(() => {
        console.log('[Settings] useEffect')
        const subscription = watch( data => {
            // Will be called on each input change of any of the controls
            // At least, no re-render happens
            console.log('[watch subscription]', data);
            const actionPayload = {
                // Filters
                Filters: {
                    Project: data.Project,
                    Year: data.Year ? data.Year.map(x => x.value): [],
                    Region: data.Region ? data.Region.map(x => parseInt(x.value)): [],
                    District: data.District ? data.District.map(x => parseInt(x.value)): [],
                    Status: data.Status ? data.Status.map(x => parseInt(x.value)): [],
                    FundSource: data['Fund Source'] ? data['Fund Source'].map(x => parseInt(x.value)): [],
                    Contractor: data.Contractor ? data.Contractor.map(x => parseInt(x.value)): [],
                    Category: data.Category ? data.Category.map(x => parseInt(x.value)): [],
                    ContractId: data['Contract Id']
                },
                // Grouping
                Grouping: data.Grouping
            }            
            //dispatch(setSettings(actionPayload));
            dispatch(setSettingsAsync(actionPayload));            
        });

        return () => {
            // Need to unsubscribe, otherwise the subscription function will be called 1 time each per registerd control, for each keystroke
            subscription.unsubscribe();
        }
    }, [watch]);

    const createGroupingFields = () => {
        return <div className="groupingFieldsContainer">
            <label className="groupingField">
                <input type="radio" name="groupingFields" value="Year"
                    {...register("Grouping", { required: true })}
                >
                </input>
                <span>Year</span>
            </label>
            <label className="groupingField">
                <input type="radio" name="groupingFields" value="Region"
                    {...register("Grouping", { required: true })}
                >
                </input>
                <span>Region</span>
            </label>
            <label className="groupingField">
                <input type="radio" name="groupingFields" value="District"
                    {...register("Grouping", { required: true })}
                >                    
                </input>
                <span>District</span>
            </label>
            <label className="groupingField">
                <input type="radio" name="groupingFields" value="Fund Source"
                    {...register("Grouping", { required: true })}
                >                    
                </input>
                <span>Fund Source</span>
            </label>            
            <label className="groupingField">
                <input type="radio" name="groupingFields" value="Contractor"
                    {...register("Grouping", { required: true })}
                >                    
                </input>
                <span>Contractor</span>
            </label>
            <label className="groupingField">
                <input type="radio" name="groupingFields" value="Category" 
                    {...register("Grouping", { required: true })}
                >                    
                </input>
                <span>Category</span>
                <i className="bx bxs-flask bx-xs bx-fw" color="red"
                    data-tooltip-id='generic-tooltip'
                    data-tooltip-content={getCategoryTooltipMessage()}
                ></i>
            </label>
            <label className="groupingField">
                <input type="radio" name="groupingFields" value="Project" defaultChecked 
                    {...register("Grouping", { required: true })}
                >                    
                </input>
                <span>Project</span>
            </label>
        </div>;
    }

    const comboOptions = {
        Year: formatComboOptions(uniqueYears),
        Region: formatMasterDataComboOptions(uniqueRegions),
        District: formatMasterDataComboOptions(uniqueDistricts),
        Contractor: formatMasterDataComboOptions(uniqueContractors),
        Status: formatMasterDataComboOptions(uniqueStatuses),
        "Fund Source": formatMasterDataComboOptions(uniqueSourceOfFunds),
        Category: formatCategoryComboOptions(uniqueCategories),
    }

    const getFilterLabel = (fieldName) => {
        if (fieldName === 'District') {
            return <div className="fieldLabel">                
                {fieldName}
                <span className='fieldInfo'
                    data-tooltip-id='generic-tooltip'
                    data-tooltip-content={getDistrictTooltipMessage()}
                    style={{cursor: 'pointer'}}> 🛈 :</span>
            </div>
        }

        if (fieldName === 'Project') {
            return <div className="fieldLabel">                
                {fieldName}
                <span className='fieldInfo'
                    data-tooltip-id='generic-tooltip'
                    data-tooltip-content={getProjectTooltipMessage()}
                    style={{cursor: 'pointer'}}> 🛈 :</span>
            </div>
        }

        if (fieldName === 'Category') {
            return <div className="fieldLabel">
                <span>{fieldName}</span>
                <i className='fieldInfo bx bxs-flask bx-xs bx-fw'
                    data-tooltip-id='generic-tooltip'
                    data-tooltip-content={getCategoryTooltipMessage()}
                    style={{cursor: 'pointer'}}
                ></i>
                <span>:</span>
            </div>
        }

        return <div className="fieldLabel">
            {fieldName}:
        </div>
    }

    const createFilterField = (fieldName, fieldType, options) => {
        const customStylesSelect = {
            container: provided => ({
              ...provided,
              width: '100%',
            }),
            control: base => ({
                ...base,
                border: '1px solid darkgray',
                boxShadow: '1px solid darkgray',
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
            },
            menu: (base) => ({ ...base, zIndex: 1 }),
            menuPortal: (base) => ({ ...base, zIndex: 1 }),
        };

        const customComponents = {};
        let inputElem = null;
        if (fieldType === 'text') {
            inputElem = <Controller
            name={fieldName}
            control={control}
            defaultValue=""            
            render = {(props) => {                    
                    return <DebouncedTextField controllerProps={props} placeholder={options?.placeHolder}></DebouncedTextField>
                }
            }
            />
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
                        if (filteredOptions.length >= 100) {
                            filteredOptions.push({label: 'Max of 100 contractors shown. Type a more specific filter to find more contractors.', value: null, isDisabled: true});
                        }
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
                    placeholder={options?.placeHolder || `Select or type in ${fieldName} Name...`}
                    components={customComponents}
                />
            )}
            />;
        }
        else if (fieldName === 'Category') {
            inputElem = <Controller
            name={fieldName}
            control={control}
            defaultValue=""
            render = {({ field}) => (
                <CustomMenuWithDescription {...field} 
                    className="fieldSelect"
                    options={comboOptions[fieldName]}
                    styles={customStylesSelect}
                    isMulti={true}
                    closeMenuOnSelect={false}
                    placeholder={options?.placeHolder || `Select ${fieldName}...`}
                    ref={null}
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
                    placeholder={options?.placeHolder || `Select ${fieldName}...`}
                />
            )}
            />;
        }
            
        let fieldInputClassName = 'fieldInput';
        if (options?.largeCombo) {
            fieldInputClassName += ' fieldInput-large';
        }

        return <>
            {getFilterLabel(fieldName)}
            <div className={fieldInputClassName}>                
                {inputElem}
            </div>
        </>
    }

    const formMain = <form className="mainForm">
        {/* <div className="collapsibleContainerText">
            <i className="bx bxs-cog"></i>
            <span>Settings</span>
        </div> */}
        {/* Filter */}
        <div className="groupForm">
            <div className="groupLabel">
                <i className="bx bxs-filter-alt"></i> Filters
            </div>
            <div className="fieldTable">
            {createFilterField('Year', 'combo', {placeHolder: 'e.g. "2024", "2023" (multiselect)'})}
            {createFilterField('Region', 'combo', {placeHolder: 'e.g. "region x", "region iii" (multiselect)'})}
            {createFilterField('District', 'combo', {placeHolder: 'e.g. "cavite", "bulacan" (multiselect)'})}
            {createFilterField('Project', 'text', {placeHolder: 'e.g. "tondo", "panguil bay", "up diliman" '})}
            {createFilterField('Status', 'combo', {placeHolder: 'e.g. "completed", "on-going" (multiselect) '})}
            {createFilterField('Fund Source', 'combo', {placeHolder: 'e.g. "gaa 2024", "gaa 2016" (multiselect)'})}
            {createFilterField('Contractor', 'combo', {largeCombo: false, placeHolder: 'e.g. "sunwest", "alro", "hi-tone", "graia" (multiselect)'})}
            {createFilterField('Contract Id', 'text', {placeHolder: 'e.g. "24B00084", "23B00040", "24CI0030"'})}
            {createFilterField('Category', 'combo', {placeHolder: 'e.g. "road", "footbridge", "flood" (multiselect)'})}
            </div>
        </div>
    {/* Gouping */}
    <div className="groupForm">
            <div className="groupLabel">
                <i className="bx bx-merge"></i> View By / Grouping
            </div>
        </div>
        {createGroupingFields()}
    </form>
    return formMain;
}