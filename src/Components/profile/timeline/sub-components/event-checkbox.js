
import React from 'react';
const EventCheckbox = (props) => {
    return (
        <input
            type="checkbox"
            checked={props.isChecked}
            onClick={(e) => {
                props.onProjectEventSelect(props.post, e.target.value)
            }} />
    )
};

export default EventCheckbox;