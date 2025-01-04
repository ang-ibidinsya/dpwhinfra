import React from "react";
import { default as ReactSelect } from "react-select";
import { components } from "react-select";

// This Control customizes React-select:
// - Options contain checkboxes
// - Value always just displays a default text

// Options with Checkbox
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

// Fixed Placeholder inside ValueContainer
const CustomValueContainer = ({ children, ...props }) => {
    return (
      <components.ValueContainer {...props}>
        <components.Placeholder {...props} isFocused={props.isFocused}>
          Select Columns...
        </components.Placeholder>
        {React.Children.map(children, child =>
          child && child.type !== components.Placeholder ? child : null
        )}
      </components.ValueContainer>
    );
};

const MultiValueContainer = (props) => null;
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
                ValueContainer: CustomValueContainer
            }}
            styles={{
                option: (base, state) => ({
                    ...base,
                    height: '100%',
                    backgroundColor: state.isSelected ? "rgba(108, 149, 209, 0.3)" : "white",
                    color: "black",
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
                    position: 'absolute',
                }),
            }}
            onChange={props.onChange}
        />
    );
};

export default MultiSelectCheckbox;
