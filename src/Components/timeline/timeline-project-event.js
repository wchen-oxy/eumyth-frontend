import React from 'react';
import { returnContentImageURL } from 'utils/url';

const ProjectEvent = (props) => {
    const post = props.post;
    let isDraft = props.post.status === 'DRAFT';
    let displayedType = null;
    let classType = null;
    switch (props.post.status) {
        case ("DRAFT"):
            isDraft = true;
            displayedType = "Ongoing";
            classType = "timelineprojectevent-draft";
            break;
        case ("COMPLETE"):
            isDraft = false;
            displayedType = "Completed";
            classType = "timelineprojectevent-completed";
            break;
        case ("PUBLISHED"):
            isDraft = false;
            displayedType = "Published";
            classType = "timelineprojectevent-published";
            break;
        default:
            throw new Error("Type mismatched")
    }
    return (
        <div className={classType}>
            <div className='timelineprojectevent-cover-container'>
                {post.mini_cover_photo_key &&
                    <img src={returnContentImageURL(post.mini_cover_photo_key)}
                    />
                }
            </div>
            <h4 className='timelineprojectevent-title-container'>
                {post.title ? post.title : post.pursuit_category}
            </h4>
            {post.overview && <h6 className='event-overview-container'>{post.overview}</h6>}
            <p> {displayedType}</p>
        </div>
    );
}

export default ProjectEvent;