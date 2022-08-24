import React from 'react';
import CreatableSelect from 'react-select/creatable';
import { PURSUIT_FIELD } from 'utils/constants/form-data';
import { checkInputNotNull } from 'utils/validator';

const defaultOption = { label: 'Search Only Your Pursuits', value: 'ALL' };
const formatPrompt = (string) => string;
const formatOptions = (data) => data.map((value) => {
    if (value === 'ALL') return ({ label: 'Search Only Your Pursuits', value: value });
    else
        return ({ label: value, value: value });
});


const ProjectFields = (props) => {
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
        <div>
 
        <CreatableSelect
            isClearable
            defaultValue={defaultOption}
            options={options}
            formatCreateLabel={formatPrompt}
            onChange={onValueChange}
        />
        <button className="btn-round" onClick={props.onSubmitSearch}>Submit</button>
                   
        </div>
    )
}

export default ProjectFields;