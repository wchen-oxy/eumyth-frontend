import React from 'react';
import { returnUserImageURL } from "../../constants/urls";
import { returnFormattedDate } from "../../constants/ui-text";
import "./timeline-short-event.scss";
import EventLabels from './sub-components/event-labels';

const ShortEvent = (props) => {
    const post = props.post;
    const coverPhotoSource =
        post.cover_photo_key ?
            returnUserImageURL(post.cover_photo_key)
            :
            returnUserImageURL(post.image_data[0]);
    const date = post.date ? returnFormattedDate(post.date) : null;

    // post.labels.length > 0 ?
    //     post.labels.map(
    //         value => {
    //             return (
    //                 <span>
    //                     <div className={"shortevent-outer-label-container"}>
    //                         <div className={"shortevent-inner-label-container"}>
    //                             <p>
    //                                 {value}
    //                             </p>
    //                         </div>
    //                     </div>
    //                 </span>)
    //         })
    //     : <></>;
    const postInfo = (
        <div className="shortevent-text-container">
            {post.title ? <h4>{post.title}</h4> : <></>}
            {date ? <p>{date.month}, {date.day}, {date.year} </p> : <></>}
            {post.pursuit_category ?
                (<div className="shortevent-progression-container">
                    <p>
                        {post.pursuit_category}
                        {post.progression === 2 ? " " + "MileStone" : " " + "Progress"}
                    </p>
                </div>)
                : <></>
            }
            <div className="shortevent-dynamic-container" >
                <div className="shortevent-all-labels-container">
                    <EventLabels labels={post.labels} />
                </div>
                <div className="shortevent-comment-text-container">
                    <p className="shortevent-comment-text">
                        {props.commentCount} Comments
                     </p>
                </div>
            </div>

        </div>);
    if (!post.cover_photo_key) {
        return (
            <div>
                <div className="shortevent-no-cover-photo-container">
                    <p>{post.text_snippet}</p>
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
                        src={coverPhotoSource} />
                </div>
                {postInfo}
            </div>
        );
    }
}

export default ShortEvent;