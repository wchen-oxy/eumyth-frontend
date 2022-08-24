import React from 'react';

const MinutesInput = (props) => {
    return (
        <div id='minutesinput'>
            <label>Total Minutes</label>
            <input
                id='minutesinput-number'
                type='number'
                value={props.min}
                min={0}
                onChange={(e) => props.setMinDuration(e.target.value)}>
            </input>
        </div>
    );
}

export default MinutesInput;