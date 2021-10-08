import React from 'react';
import EventTextInfo from './sub-components/event-text-info';
import { returnUserImageURL } from 'utils/url';
import { returnFormattedDate } from 'utils/constants/ui-text';
import './timeline-event-hero-content.scss';

const EventHeroContent = (props) => {
    const post = props.post;
    return (
        <div>
            {post.cover_photo_key ?
                <div className='eventherocontent-with-cover-photo-container'>
                    <img
                        alt='short event cover photo'
                        className='eventherocontent-cover-photo'
                        src={post.cover_photo_key ?
                            returnUserImageURL(post.cover_photo_key)
                            :
                            returnUserImageURL(post.image_data[0])} />
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