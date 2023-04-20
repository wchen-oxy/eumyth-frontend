import React from 'react';
import { toTitleCase } from 'utils';
import { returnContentImageURL } from 'utils/url';

const ProjectEvent = (props) => {
    const post = props.post;
    const hasCoverPhoto = !!post.mini_cover_photo_key;

    const image = hasCoverPhoto ?
        <img
            alt='cover'
            className='timelineprojectevent-cover'
            src={returnContentImageURL(post.mini_cover_photo_key)}
        />
        : null;
    const IDType = hasCoverPhoto ? 'timelineprojectevent-with-image' : 'timelineprojectevent-no-image';
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
        <div id={IDType}>
            {image}
            <div className={classType}>
                <h2>
                    {post.title}
                </h2>
                {post.overview && <h6 className='event-overview'>{post.overview}</h6>}
                <div id='timelineproject-meta'>
                    <div className='timelineproject-meta-pursuit'>
                        <p>{toTitleCase(post.pursuit)}</p>
                    </div>
                    <div className='timelineproject-meta-status'>
                        <p> {displayedType}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default ProjectEvent;