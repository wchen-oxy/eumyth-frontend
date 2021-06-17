import React from 'react';
import EventLabels from './event-labels';
import "./event-text-info.scss";


const EventTextInfo = (props) => (
    <div className="eventtextinfo-text-container">
        {props.title ? <h4>{props.title}</h4> : <></>}
        {props.date ? <p>{props.date.month}, {props.date.day}, {props.date.year} </p> : <></>}
        {props.pursuit_category ?
            (<div className="eventtextinfo-progression-container">
                <p>
                    {props.pursuitCategory}
                    {props.progression === 2 ? " " + "MileStone" : " " + "Progress"}
                </p>
            </div>)
            : <></>
        }
        <div className="eventtextinfo-dynamic-container" >
            <div className="eventtextinfo-all-labels-container">
                <EventLabels labels={props.labels} />
            </div>
            <div className="eventtextinfo-comment-text-container">
                <p className="eventtextinfo-comment-text">
                    {props.commentCount} Comments
                 </p>
            </div>
        </div>

    </div>);

export default EventTextInfo;