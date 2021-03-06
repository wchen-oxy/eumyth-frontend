import React from 'react';
import { returnUserImageURL } from "../../../constants/urls";
import { returnFormattedDate } from "../../../constants/ui-text";
import "./timeline-short-event.scss";

const ShortEvent = (props) => {
    const post = props.post;
    const date = post.date ? returnFormattedDate(post.date) : null;
    const postInfo = (<div className="shortevent-text-container">
        {post.title ? <h4>{post.title}</h4> : <></>}
        {post.pursuit_category ?
            <p>{post.pursuit_category} {post.is_milestone ? "MileStone" : "Progress"}</p>
            : <></>
        }
        {date ? <p>{date.month}, {date.day}, {date.year} </p>
            : <></>
        }
        <div className="shortevent-comment-text-container">
            <p className="shortevent-comment-text">{props.commentCount} Comments</p>
        </div>
    </div>);
    if (!post.cover_photo_key) {
        const intitialText = post.text_snippet;
        return (
            <div>
                <div className="shortevent-no-cover-photo-container">
                    <p>{intitialText}</p>
                </div>
                {postInfo}
            </div>
        );

    }
    else {
        return (
            <div>
                <div className="shortevent-with-cover-photo-container">
                    <img
                        alt="short event cover photo"
                        className="shortevent-cover-photo"
                        src={
                            post.cover_photo_key ?
                                returnUserImageURL(post.cover_photo_key) :
                                returnUserImageURL(post.image_data[0])
                        } />
                </div>
                {postInfo}
            </div>
        );
    }
}

export default ShortEvent;