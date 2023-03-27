import React from 'react';
import EventLabels from './event-labels';

const EventBottomInfo = (props) => (
    <div className='eventbottominfo'>
        <div className='eventbottominfo-dynamic' >
            <div className='eventbottominfo-labels'>
                {props.labels && <EventLabels labels={props.labels} />}
            </div>
            <div className='eventbottominfo-comment'>
                <p >
                    {props.commentCount} Comments
                </p>
            </div>
        </div>
    </div>);

export default EventBottomInfo;