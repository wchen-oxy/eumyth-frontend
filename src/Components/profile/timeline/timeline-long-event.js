import React from 'react';
import { returnUserImageURL } from "../../constants/urls";
import { returnFormattedDate } from "../../constants/ui-text";
import "./timeline-long-event.scss";
import EventTextInfo from './sub-components/event-text-info';

const LongEvent = (props) => {
    if (props.post.text_data === undefined) return (<></>);
    const post = props.post;
    const date = post.date ? returnFormattedDate(post.date) : null;
    const coverPhotoContainerStyle = post.cover_photo_key ?
        "longevent-with-cover-photo-container"
        :
        "longevent-no-cover-photo-container";


    return (
        <div>
            <div className={coverPhotoContainerStyle}>
                {post.cover_photo_key ?
                    (
                        <img
                            alt="Cover Photo"
                            className="longevent-cover-photo"
                            src={returnUserImageURL(post.cover_photo_key)}
                        />)
                    :
                    <p>{post.text_snippet}</p>
                }
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

export default LongEvent;