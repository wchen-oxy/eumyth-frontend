import React from 'react';
import { returnUserImageURL } from 'utils/url';
import './event.scss';

const SpotlightEvent = (props) => {
    return (
        <div className='spotlightevent-main-container'
            onClick={() => props.onEventClick(props.post)}
        >
            <div className='spotlightevent-cover-container'>
                {props.post.cover_photo_key &&
                    <img
                        alt='event cover photo'
                        className='event-cover-photo'
                        src={returnUserImageURL(props.post.cover_photo_key)}
                    />
                }
            </div>
            <div className='spotlightevent-description-container'>
                <h3>
                    {props.post.title}
                </h3>
                <h4>{props.post.overview}</h4>

            </div>
        </div>
    )
}
export default SpotlightEvent;