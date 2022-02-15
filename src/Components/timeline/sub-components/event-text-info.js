import React from 'react';
import EventLabels from './event-labels';
import './event-text-info.scss';


const EventTextInfo = (props) => (
    <div className='eventtextinfo-text-container'>
        {props.title ? <h4>{props.title}</h4> : <></>}
        {props.date ? <p>{props.date.month}, {props.date.day}, {props.date.year} </p> : <></>}
        {props.pursuitCategory
            &&
            (
                <div className='eventtextinfo-progression-container'>
                    <h5>{props.pursuitCategory}</h5>
                    <p> {props.progression === 2 && ' ' + 'MileStone'}     </p>
                </div>
            )}
        <div className='eventtextinfo-dynamic-container' >
            <div className='eventtextinfo-all-labels-container'>
                {props.labels && <EventLabels labels={props.labels} />}
            </div>
            <div className='eventtextinfo-comment-text-container'>
                <p className='eventtextinfo-comment-text'>
                    {props.commentCount} Comments
                </p>
            </div>
        </div>
    </div>);

export default EventTextInfo;