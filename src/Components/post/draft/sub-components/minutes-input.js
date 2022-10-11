import React from 'react';

const MinutesInput = (props) => {
    return (
        <div className='btn-meta'>
            <label>Total Minutes</label>
            <input
                id='minutesinput-number'
                type='number'
                value={props.minDuration}
                min={0}
                onChange={(e) => props.setMinDuration(e.target.value)}>
            </input>
        </div>
    );
}

export default MinutesInput;