import React, { Component } from 'react';
import CreatableSelect from 'react-select/creatable';
import { components } from 'react-select';
import { checkInputNotNull } from '../../util';

const formatter = (data) => data.map((value) => ({ label: value, value: value }));

const Menu = props => {
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

export default class CustomMultiSelect extends Component {

  isValidNewOption = (inputValue, selectValue) =>
    inputValue.length > 0 && selectValue.length < 5;
  render() {
    const defaults = checkInputNotNull(this.props.selectedLabels, formatter);
    const options = checkInputNotNull(this.props.options, formatter);
    return (
      <CreatableSelect
        isMulti
        onChange={this.props.onSelect}
        defaultValue={defaults}
        options={options}
        components={{ Menu }}
        isValidNewOption={this.isValidNewOption}
      />
    );
  }
}