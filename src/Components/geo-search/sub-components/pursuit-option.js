import React from 'react';
import { toTitleCase } from 'utils';
import { ALL } from 'utils/constants/flags';

const PursuitOption = props => {
    const pursuit = props.pursuit === ALL ? "All of Your Pursuits" : toTitleCase(props.pursuit)
    return (
        <div className='pursuitoption input-hero-search' onClick={props.onClick}>
            <p>{pursuit}</p>
        </div>
    )

}

export default PursuitOption;