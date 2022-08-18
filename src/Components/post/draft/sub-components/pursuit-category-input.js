import React from 'react';

const PursuitCategoryInput = (props) => {
    let pursuitSelects = [];

    pursuitSelects.push(<option key={"null"} value={null}></option>)
    for (let i = 1; i < props.pursuitNames.length; i++) {
        const pursuit = props.pursuitNames[i];
        pursuitSelects.push(
            <option key={pursuit} value={pursuit}>{pursuit}</option>
        );
    }

    return (
        <div id='pursuitcategoryinput-main'>
            <label>Pursuit</label>
            <select
                name="pursuit-category"
                id='pursuitcategoryinput-content'
                value={props.pursuit}
                onChange={(e) => props.setPursuit(e.target.value)}
            >
                {pursuitSelects}
            </select>
        </div>

    )
}

export default PursuitCategoryInput;