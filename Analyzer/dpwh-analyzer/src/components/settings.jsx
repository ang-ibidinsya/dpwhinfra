import './settings.css';
import { useForm, Controller } from 'react-hook-form';
import { useEffect } from 'react';
import { useDispatch, useSelector} from 'react-redux';
import Select from 'react-select';
import {setSettings} from '../state/data/dataSlice';
import {uniqueYears} from './filterItems';

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

    //debugger

    const comboOptions = {
        Year: formatComboOptions(uniqueYears),
        Region: formatMasterDataComboOptions(uniqueRegions),
        District: formatMasterDataComboOptions(uniqueDistricts),
        Contractor: formatMasterDataComboOptions(uniqueContractors)
    }

    const createFilterField = (fieldName, fieldType) => {
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

        const inputElem = fieldType === 'text' ? 
            <input {...register(fieldName)} type="text" className="fieldText"></input> :
            <Controller
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
                    />
                )}
            />
        return <>
            <div className="fieldLabel">
                {fieldName}:
            </div>
            <div className="fieldInput">                
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
            {createFilterField('Contractor', 'combo')}
            {createFilterField('Project', 'text')}
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