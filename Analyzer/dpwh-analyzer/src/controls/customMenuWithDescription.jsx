import './customMenuWithDescription.css';
import React from 'react';
import Select, { components } from 'react-select';

const Option = (props) => {
    return (        
            <components.Option {...props}>
                <div className='optionLabel'>{props.data.label}</div>
                <div className='optionSubtitle'>{props.data.subtitle}</div>
            </components.Option>
    );
  };
  
  export const CustomMenuWithDescription = (props) => {
    console.log('[CustomMenuWithDescription]', props);
    return <Select
        components={{ Option }}
        {...props}
    />
  };