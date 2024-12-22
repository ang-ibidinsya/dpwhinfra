import React, { PropTypes } from 'react';
import { components } from 'react-select';

export const CustomOption = ({ children, ...props }) => {
    debugger
  // eslint-disable-next-line no-unused-vars
  const { onMouseMove, onMouseOver, ...rest } = props.innerProps;
  const newProps = { ...props, innerProps: rest };
  return (
    <components.Option {...newProps}>
      {children}
    </components.Option>
  );
};

// CustomOption.propTypes = {
//   innerProps: PropTypes.object.isRequired,
//   children: PropTypes.node.isRequired
// };