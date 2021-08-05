import React from 'react';

const MinutesInput = (props) => {
    return (
        <div>
            <label>Total Minutes</label>
            <input
                type="number"
                value={props.min}
                min={0}
                onChange={(e) => props.setMinDuration(e.target.value)}>
            </input>
        </div>
    );
}

export default MinutesInput;