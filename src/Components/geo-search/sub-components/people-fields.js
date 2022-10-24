import React from 'react';
import CreatableSelect from 'react-select/creatable';
import { PURSUIT_FIELD } from 'utils/constants/form-data';
import { checkInputNotNull } from 'utils/validator';
import { toTitleCase } from 'utils';

const defaultOption = { label: 'Search Only Your Pursuits', value: 'Search Only Your Pursuits' };
const formatPrompt = (string) => string;
const PeopleFields = (props) => {
    const formatOptions = (data) => data.map((value) => {
        if (value === 'All') return ({ label: 'Search Only Your Pursuits', value: value });
        else
            return ({ label: toTitleCase(value), value: value });
    });
    const options = checkInputNotNull(props.pursuits, formatOptions);
    const onValueChange = (event) => {
        return props.onFieldChange(PURSUIT_FIELD, event?.value ?? "");
    }

    const handleInputChange = (input, action) => {
        if (action.action !== "input-blur"
            && action.action !== "menu-close"
            && input !== undefined) {
            props.onFieldChange(PURSUIT_FIELD, input);
        }

    }

    const onEnter = (e) => {
        console.log("OnEnterPressed");
        if (e.key === 'Enter') {
            props.onRefreshClick();
        }
    }
    console.log(props.selectedPursuit);

    return (
        <div id='peoplefields'>
            <div id='peoplefields-createable'
                className='peoplefields-fields' >
                <CreatableSelect
                    isClearable
                    onCloseResetsInput={false}
                    onBlurResetsInput={false}
                   
                    noOptionsMessage={() => null}
                    inputValue={props.selectedPursuit}
                    options={options}
                    onChange={onValueChange}
                    onInputChange={handleInputChange}
                    onKeyDown={onEnter}
                    createOptionPosition='first'

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
                    disabled={props.selectedPursuit.length === 0}
                    onClick={(e) => {
                        e.preventDefault();
                        props.onRefreshClick();
                    }}
                >
                    Search
                </button>
            </div>
        </div>

    )
}

export default PeopleFields;