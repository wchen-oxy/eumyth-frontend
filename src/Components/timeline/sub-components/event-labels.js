
import React from 'react';
import './event-labels.scss';

const EventLabels = (props) => {
    const labels = props.labels.map(
        (value, index) => {
            return (
                <div key={index}
                    className={'eventlabels-outer-label-container'}>
                    <div className={'eventlabels-inner-label-container'}>
                        <p>
                            {value}
                        </p>
                    </div>
                </div>
            )
        });

    return (
        <div id={props.isFullPage ? 'eventlabels-full-page-container' : 'eventlabels-partial-page-container'}>
            {labels}
        </div>
    )
}



export default EventLabels;