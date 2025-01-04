import React from "react";
import PropTypes from "prop-types";
import { default as ReactSelect } from "react-select";
import { components } from "react-select";

const Option = props => {    
    return (
        <div>
            <components.Option {...props}>
            <input
                type="checkbox"
                checked={props.isSelected}
                onChange={() => null}
            />{" "}
            <label>{props.label}</label>
            </components.Option>
        </div>
    );
};

const MultiValue = props => {
    let labelToBeDisplayed = `${props.data.label}, `;
    if (props.data.value === allOption.value) {
      labelToBeDisplayed = "All is selected";
    }
    return (
      <components.MultiValue {...props}>
        <span>{labelToBeDisplayed}</span>
      </components.MultiValue>
    );
};

const Placeholder = (props) => {
    return null;
};

const ClearIndicator = props => null;

// const IndicatorsContainer = props => {
//     //return <div style={{border: '1px solid red', width: '200px', height: '100%', textAlign:'center'}}>Select Columns</div>
//     return null;
// }

const IndicatorsContainer = (props) => {
    return (
      <div style={{ background: 'red' }}>
        <components.IndicatorsContainer {...props} />
      </div>
    );
  };

const ValueContainer = ({children, getValue, setValue,...props}) => {
    //return <div style={{border: '0px solid red', width: '200px', height: '100%', textAlign:'center'}}>Select Columns</div>
    //debugger
    let currValue = getValue();
    //console.log('[ValueContainer] currValue', currValue);
    //console.log('[ValueContainer] props', props, 'children', children);
    let filteredChildren = children.filter(c => c.key !== 'placeholder');
    //console.log('[ValueContainer] props', props, 'filtered children', filteredChildren);
    return <components.ValueContainer 
    {...props}
    
    >
      {children}
      <div style={{position: 'absolute', width: '100%', textAlign: 'center'}}>Select Columns...</div>
    </components.ValueContainer>
};

const MultiValueContainer = (props) => {
    return null;
};

const MultiValueLabel = (props) => null;
  
export const MultiSelectCheckbox = props => {
    return (
        <ReactSelect
            {...props}
            isMulti
            isClearable={false}
            isSearchable={false}
            options={props.options}
            hideSelectedOptions={false}
            closeMenuOnSelect={false}
            components={{
                Option,
                MultiValueContainer,
                MultiValueLabel,
                Placeholder,
                //IndicatorsContainer,
                ValueContainer
                // MultiValue,
                // ValueContainer
            }}
            styles={{
                option: (base) => ({
                    ...base,
                    height: '100%',                
                }),
                control: provided => ({
                    ...provided,
                    paddingLeft: '0px',
                    border: '1px solid darkgray',
                    boxShadow: '1px solid darkgray',
                    "&:hover": {
                        border: "1px solid #054bfc",
                        cursor: 'pointer'
                    },
                }),
                container: provided => ({
                    ...provided,
                    width: '250px',
                    padding: '5px',                    
                }),
                placeholder: (provided) => ({
                    ...provided,
                    color: 'black',  // Change placeholder text color
                }),
                // valueContainer: (provided) => ({
                //     ...provided,
                //     border: '1px solid blue',
                //     backgroundColor: 'red',
                    
                // }),
            }}
            onChange={props.onChange}
            // onChange={(selected, event) => {
            //     debugger
            //     if (selected !== null && selected.length > 0) {
            //         let result = [];
            //         if (selected.length === props.options.length) {
            //             if (event.action === "select-option") {
            //                 result = [props.allOption, ...props.options];
            //             }
            //             return props.onChange(result);
            //         }
            //     }
        
            //     return props.onChange(selected);
            // }}
        />
    );
};

/*
MySelect.propTypes = {
  options: PropTypes.array,
  value: PropTypes.any,
  onChange: PropTypes.func,
  allowSelectAll: PropTypes.bool,
  allOption: PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string
  })
};
*/

export default MultiSelectCheckbox;
