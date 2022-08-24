import React from 'react';

const DateInput = (props) =>
(
    <div id='datainput'>
        <label>Date</label>
        <input
            type='date'
            id='datainput-content'
            value={props.date}
            onChange={(e) => props.setDate(e.target.value)}
        ></input>
    </div>
)

export default DateInput;