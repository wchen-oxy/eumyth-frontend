
import React from 'react';
const EventCheckbox = (props) => {
    return (
        <input
            type="checkbox"
            checked={props.isChecked}
            onChange={(e) => {
                props.onProjectEventSelect(props.post, e.target.value)
            }} />
    )
};

export default EventCheckbox;