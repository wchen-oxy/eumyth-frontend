
import React from 'react';
import './event-labels.scss';

const EventLabels = (props) => (
    props.labels && props.labels.length > 0 ?
        props.labels.map(
            (value, index) => {
                return (
                    <span key={index}>
                        <div className={'eventlabels-outer-label-container'}>
                            <div className={'eventlabels-inner-label-container'}>
                                <p>
                                    {value}
                                </p>
                            </div>
                        </div>
                    </span>)
            })
        : <></>)

export default EventLabels;