import React, { Component } from 'react';
import CreatableSelect from 'react-select/creatable';
import {components} from 'react-select';
 
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
    return (
      <CreatableSelect
        components={{ Menu }}
        isMulti
        onChange={this.props.onSelect}
        options={this.props.options ? this.props.options : null}
        isValidNewOption={this.isValidNewOption}
      />
    );
  }
}