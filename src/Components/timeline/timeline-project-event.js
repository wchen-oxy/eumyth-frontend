import React from 'react';
import { returnUserImageURL } from 'utils/url';
import './timeline-project-event.scss';

const ProjectEvent = (props) => {
    const post = props.post;
    const isDraft = props.post.status === 'DRAFT';
    return (
        <div className={isDraft ? 'timelineprojectevent-draft' : null} >
            <div className='event-cover-container'>
                {post.cover_photo_key ?
                    <img
                        alt='event cover photo'
                        className='event-cover-photo'
                        src={returnUserImageURL(post.cover_photo_key)}
                    />
                    : <p className='no-select'></p>
                }
            </div>
            <h4 className='event-title-container'>
                {post.title ? post.title : post.pursuit_category}
            </h4>
            {post.overview && <h6 className='event-overview-container'>{post.overview}</h6>}
            {isDraft ? <p>[Draft]</p> : <p>[Published]</p>}
        </div>
    );
}

export default ProjectEvent;