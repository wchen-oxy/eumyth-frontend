import React from 'react';
import Step from './step';

const Steps = (props) => {
    return (
        <div id="steps">
            <Step case={1} current={props.current} />
            <Step case={2} current={props.current} />
            <Step case={3} current={props.current} />
        </div>
    )
}

export default Steps;