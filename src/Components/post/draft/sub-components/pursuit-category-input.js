import React from 'react';
import { toTitleCase } from 'utils';
const PursuitCategoryInput = (props) => {
    let pursuitSelects = [];

    pursuitSelects.push(<option key={"null"} value={null}></option>)
    for (let i = 1; i < props.pursuitNames.length; i++) {
        const pursuit = props.pursuitNames[i];
        pursuitSelects.push(
            <option key={pursuit} value={pursuit}>{toTitleCase(pursuit)}</option>
        );
    }

    return (
        <div className='btn-meta'>
            <label>Pursuit</label>
            <select
                name="pursuit-category"
                id='pursuitcategoryinput-select'
                value={props.pursuit}
                onChange={(e) => props.setPursuit(e.target.value)}
            >
                {pursuitSelects}
            </select>
        </div>

    )
}

export default PursuitCategoryInput;