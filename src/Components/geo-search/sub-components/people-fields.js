import React from 'react';
import CreatableSelect from 'react-select/creatable';
import { PURSUIT_FIELD } from 'utils/constants/form-data';
import { checkInputNotNull } from 'utils/validator';
import './people-fields.scss'

const defaultOption = { label: 'Search Only Your Pursuits', value: 'ALL' };
const formatPrompt = (string) => "Add " + string;
const PeopleFields = (props) => {
    const formatOptions = (data) => data.map((value) => {
        if (value === 'ALL') return ({ label: 'Search Only Your Pursuits', value: value });
        else
            return ({ label: value, value: value });
    });
    const options = checkInputNotNull(props.pursuits, formatOptions)
    const onValueChange = (object) => {
        if (object) {
            return props.onFieldChange(PURSUIT_FIELD, object.value);
        }
        else {
            return props.onFieldChange(PURSUIT_FIELD, null);
        }
    }
    console.log(props.selectedPursuit)
    return (
        <div id='peoplefields-main-container'>
            <div id='peoplefields-createable-container'
                className='peoplefields-toggle-container' >
                <CreatableSelect
                    isClearable
                    defaultValue={defaultOption}
                    options={options}
                    formatCreateLabel={formatPrompt}
                    onChange={onValueChange}

                />
            </div>
            <div className='peoplefields-toggle-container'>
                <button
                    id="peoplefields-refresh-button"
                    onClick={props.onRefreshClick}
                    disabled={!props.selectedPursuit}
                >
                    Search
                </button>
            </div>
        </div>

    )
}

export default PeopleFields;