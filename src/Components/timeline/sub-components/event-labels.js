import React from 'react';

const EventLabels = (props) => {
    const labels = props.labels.map(
        (value, index) => {
            return (
                <div key={index}
                    className={'eventlabels-background'}>
                    <div className={'eventlabels-foreground'}>
                        <p>
                            {value}
                        </p>
                    </div>
                </div>
            )
        });

    return (
        <div id={props.isFullPage ? 'eventlabels-full' : 'eventlabels-partial'}>
            {labels}
        </div>
    )
}



export default EventLabels;