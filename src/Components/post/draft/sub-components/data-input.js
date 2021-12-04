import React from 'react';
import './data-input.scss';

const DateInput = (props) =>
(
    <div id='datainput-main'>
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