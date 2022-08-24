import React from 'react';
import CreatableSelect from 'react-select/creatable';
import { PURSUIT_FIELD } from 'utils/constants/form-data';
import { checkInputNotNull } from 'utils/validator';

const defaultOption = { label: 'Search Only Your Pursuits', value: 'ALL' };
const formatPrompt = (string) => string;
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

    return (
        <div id='peoplefields'>
            <div id='peoplefields-createable'
                className='peoplefields-fields' >
                <CreatableSelect
                    isClearable
                    defaultValue={defaultOption}
                    options={options}
                    formatCreateLabel={formatPrompt}
                    onChange={onValueChange}

                />
                <div id='peoplefields-distance'>
                    <select onChange={(e) => props.onDistanceChange(e.target.value)}>
                        <option value={10}>10 Miles</option>
                        <option value={50}>50 Miles</option>
                        <option value={100}>100 Miles</option>
                        <option value={250}>250 Miles</option>
                        <option value={500}>500 Miles</option>
                    </select>

                </div>
            </div>
            <div className='peoplefields-fields'>
                <button
                    id="peoplefields-refresh"
                    className="btn-round"
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