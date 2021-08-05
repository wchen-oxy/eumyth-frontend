
import React from 'react';
const EventCheckbox = (props) => {
    return (
        <input
            type="checkbox"
            defaultChecked={props.isChecked}
            onClick={(e) => {
                console.log("asf");
                props.onProjectEventSelect(props.post, e.target.value)
            }} />
    )
};

export default EventCheckbox;