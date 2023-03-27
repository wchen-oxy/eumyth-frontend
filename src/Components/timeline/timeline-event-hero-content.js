import React from 'react';
import EventTextInfo from './sub-components/event-text-info';
import { returnContentImageURL } from 'utils/url';
import { returnFormattedDate } from 'utils/constants/ui-text';
import { toTitleCase } from 'utils';
import EventDatePursuit from './sub-components/event-date-pursuit';
import EventPreview from './sub-components/event-preview';

const EventHeroContent = (props) => {
    const post = props.post;
    const image = post.cover_photo_key ?
        returnContentImageURL(post.cover_photo_key)
        :
        returnContentImageURL(post.image_data[0]);

    if (image) {
        return (
            <div>
                <EventPreview isImage image={image} />

                <div className='eventhero-text'>
                    {post.title ? <h4 className='eventhero-image-title'>{post.title}</h4> : <></>}
                    <EventDatePursuit
                        date={post.date}
                        pursuit={post.pursuit_category}

                    />
                    <EventTextInfo
                        labels={post.labels}
                        commentCount={props.commentCount}
                    />
                </div>
            </div>
        )
    }
    else {
        return (
            <div>
                {post.title ?
                    <h4 className='eventhero-no-image-title'>
                        {post.title}
                    </h4> :
                    <></>}
                <div className='eventhero-text'>
                    <EventDatePursuit
                        date={post.date}
                        pursuit={post.pursuit_category}
                    />
                    <EventPreview isText snippet={post.text_snippet} />

                    <EventTextInfo
                        labels={post.labels}
                        commentCount={props.commentCount}
                    />
                </div>
            </div>
        );
    }
}

export default EventHeroContent;