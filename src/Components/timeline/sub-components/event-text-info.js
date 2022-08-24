import React from 'react';
import EventLabels from './event-labels';

const EventTextInfo = (props) => (
    <div className='eventtextinfo'>
        {props.title ? <h4>{props.title}</h4> : <></>}
        {props.date ? <p>{props.date.month}, {props.date.day}, {props.date.year} </p> : <></>}
        {props.pursuitCategory
            &&
            (
                <div className='eventtextinfo-progression'>
                    <h5>{props.pursuitCategory}</h5>
                    <p> {props.progression === 2 && ' ' + 'MileStone'}     </p>
                </div>
            )}
        <div className='eventtextinfo-dynamic' >
            <div className='eventtextinfo-labels'>
                {props.labels && <EventLabels labels={props.labels} />}
            </div>
            <div className='eventtextinfo-comment'>
                <p >
                    {props.commentCount} Comments
                </p>
            </div>
        </div>
    </div>);

export default EventTextInfo;