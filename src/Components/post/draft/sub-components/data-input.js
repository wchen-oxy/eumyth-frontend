import React from 'react';

const DateInput = (props) =>
(
    <div>
        <label>Date</label>
        <input
            type='date'
            value={props.date}
            onChange={(e) => props.setDate(e.target.value)}
        ></input>
    </div>
)

export default DateInput;