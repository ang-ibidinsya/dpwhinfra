//https://codesandbox.io/p/sandbox/elastic-merkle-2gwfvu?file=%2Fsrc%2Fcomponents%2Fform_components%2FDebouncedTextField.js%3A36%2C17
//https://github.com/react-hook-form/react-hook-form/issues/9756
import React, { useState, useEffect, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";

//export function DebouncedTextField({ controllerProps, ...props }) {
export function DebouncedTextField(props) {
  //const{ controllerProps, ...otherProps} = props;
  const controllerProps = props.controllerProps;
  const { field } = controllerProps;
  const [innerValue, setInnerValue] = useState("");

  useEffect(() => {
    console.log(
      `DebouncedTextField from field ${field.name} has re-rendered following a form value change`
    );
    //console.log("FormState ----", formState);
    if (field.value && typeof field.value === "string")
      setInnerValue(field.value);
  }, [field.value, field.name]);

  // Debounced Callback Deferring the form update
  const debouncedHandleChange = useDebouncedCallback((event) => {
    field.onChange(event);
    field.onBlur();
  }, 1000);

  // The actual HandleChange
  const handleChange = useCallback(
    (event) => {
      event.persist();
      setInnerValue(event.target.value);
      debouncedHandleChange(event);
    },
    [debouncedHandleChange]
  );

  return (
    <input
      type="text" 
      className="fieldText"
      onChange={handleChange}
      value={innerValue}
      placeholder={props.placeholder}
    ></input>
  );
}
