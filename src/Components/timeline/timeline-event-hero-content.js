import React from 'react';
import EventTextInfo from './sub-components/event-text-info';
import { returnContentImageURL } from 'utils/url';
import { returnFormattedDate } from 'utils/constants/ui-text';

const EventHeroContent = (props) => {
    const post = props.post;
    const image = post.cover_photo_key ?
    returnContentImageURL(post.cover_photo_key)
    :
    returnContentImageURL(post.image_data[0]);
    return (
        <div>
            {image ?
                <div className='eventherocontent-with-cover-photo-container'>
                    <img
                        alt='short event cover photo'
                        className='eventherocontent-cover-photo'
                        src={image} />
                </div>
                :
                <div className='eventherocontent-no-cover-photo-container'>
                    <p>{post.text_snippet}</p>
                </div>
            }
            <EventTextInfo
                title={post.title}
                date={post.date ? returnFormattedDate(post.date) : null}
                pursuitCategory={post.pursuit_category}
                progression={post.progression}
                labels={post.labels}
                commentCount={props.commentCount}
            />
        </div>
    );
}

export default EventHeroContent;