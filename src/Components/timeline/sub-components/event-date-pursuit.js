import React from 'react';
import { toTitleCase } from 'utils';
import { returnFormattedDate } from 'utils/constants/ui-text';

const EventDatePursuit = (props) => {
    const date = props.date ? returnFormattedDate(props.date) : null;
    return (
        <div className='eventdatepursuit'>
            {
                props.pursuit
                &&
                (
                    <div className='eventdatepursuit-pursuit'>
                        <h5>{toTitleCase(props.pursuit)}</h5>
                    </div>
                )
            }
            {date ? <p className='eventdatepursuit-date'> {date.month} {date.day}, {date.year} </p> : <></>}
        </div>
    );
}

export default EventDatePursuit;