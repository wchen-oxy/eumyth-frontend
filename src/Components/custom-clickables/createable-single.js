import React from 'react';
import CreatableSelect from 'react-select/creatable';
import { components } from 'react-select';
import { checkInputNotNull } from 'utils/validator';
import { formatReactSelectOptions } from 'utils';


const Menu = (props) => {
  const optionSelectedLength = props.getValue().length || 0;
  return (
    <components.Menu {...props}>
      {optionSelectedLength < 5 ? (
        props.children
      ) : (
        <div>Please just choose 5</div>
      )}
    </components.Menu>
  );
};

const CustomMultiSelect = (props) => {
  const isValidNewOption = (inputValue, selectValue) =>
    inputValue.length > 0 && selectValue.length < 5;

  const defaults = checkInputNotNull(props.selectedLabels, formatReactSelectOptions);
  const options = checkInputNotNull(props.options, formatReactSelectOptions);
  return (
    <CreatableSelect
      isMulti
      onChange={props.onSelect}
      defaultValue={defaults}
      options={options}
      components={{ Menu }}
      isValidNewOption={isValidNewOption}
    />
  );

}
export default CustomMultiSelect;