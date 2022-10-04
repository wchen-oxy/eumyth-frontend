import React from 'react';

const Step = (props) => {
    const step = {};
    switch (props.case) {
        //case
        //is or not greyed or active
        case (1):
            step.style = 'step-number';
            step.number = 1;
            step.label = 'Main';
            break;
        case (2):
            step.style = props.current >= 2 ? 'step-number' : 'step-number-disabled';
            step.number = 2;
            step.label = 'Extras';
            break;
        case (3):
            step.style = props.current >= 3 ? 'step-number' : 'step-number-disabled';
            step.number = 3;
            step.label = 'Review';
            break;
        default:
            break;
    }
    return (
        <div className='step'>
            <div className={step.style}>
                <h3>{step.number}</h3>
            </div>
            <h4>
                {step.label}
            </h4>
        </div>

    )
}

export default Step;