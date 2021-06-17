import React from 'react';
import { returnUserImageURL } from "../../constants/urls";
import { returnFormattedDate } from "../../constants/ui-text";
import EventTextInfo from './sub-components/event-text-info';
import "./timeline-event-hero-content.scss";

const EventHeroContent = (props) => {
    const post = props.post;
    const coverPhotoSource =
        post.cover_photo_key ?
            returnUserImageURL(post.cover_photo_key)
            :
            returnUserImageURL(post.image_data[0]);
    const date = post.date ? returnFormattedDate(post.date) : null;
    if (!post.cover_photo_key) {
        return (
            <div>
                <div className="eventherocontent-no-cover-photo-container">
                    <p>{post.text_snippet}</p>
                </div>
                <EventTextInfo
                    title={post.title}
                    date={date}
                    pursuitCategory={post.pursuit_category}
                    progression={post.progression}
                    labels={post.labels}
                    commentCount={props.commentCount}
                />
            </div>
        );
    }
    else {
        return (
            <div>
                <div className="eventherocontent-with-cover-photo-container">
                    <img
                        alt="short event cover photo"
                        className="eventherocontent-cover-photo"
                        src={coverPhotoSource} />
                </div>
                <EventTextInfo
                    title={post.title}
                    date={date}
                    pursuitCategory={post.pursuit_category}
                    progression={post.progression}
                    labels={post.labels}
                    commentCount={props.commentCount}
                />
            </div>
        );
    }
}

export default EventHeroContent;