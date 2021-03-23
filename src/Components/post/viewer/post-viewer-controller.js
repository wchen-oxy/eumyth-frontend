import React from 'react';
import ShortPostViewer from "./short-post";
import LongPostViewer from "./long-post";
import { SHORT, LONG } from "../../constants/flags";
import { withFirebase } from "../../../Firebase/index";
import { returnUserImageURL, TEMP_PROFILE_PHOTO_URL } from '../../constants/urls';

const parsePossibleTitle = (data) => {
    const titleBlock = data.blocks[0];
    const isTitle = titleBlock.type === "header-one"
        || titleBlock.type === "header-two"
        || titleBlock.type === "header-three";
    if (titleBlock
        && isTitle) {
        return data.blocks[0].text;
    }
    else {
        return null;
    }
}

const removeTitleFromBody = (data) => {
    data.blocks = data.blocks.splice(1);
    return data;
}

const PostViewerController = (props) => {
    const isOwnProfile = (props.eventData.username === props.visitorUsername);
    console.log(isOwnProfile);
    const textData = props.textData && props.eventData.isPaginated ? JSON.parse(props.textData) : props.textData;
    switch (props.eventData.post_format) {
        case (SHORT):
            return (
                <ShortPostViewer
                    postId={props.eventData._id}
                    postIndex={props.postIndex}
                    displayPhoto={props.visitorDisplayPhoto}
                    username={props.username}
                    visitorUsername={props.visitorUsername}
                    pursuitNames={props.pursuitNames}
                    preferredPostType={props.preferredPostType}
                    textData={textData}
                    largeViewMode={props.largeViewMode}
                    isOwnProfile={isOwnProfile}
                    isPostOnlyView={props.isPostOnlyView}
                    eventData={props.eventData}
                    onDeletePost={props.onDeletePost}
                    closeModal={props.closeModal}
                    passDataToModal={props.passDataToModal}
                    onCommentIDInjection={props.onCommentIDInjection}
                    selectedPostFeedType={props.selectedPostFeedType}
                />
            );
        case (LONG):
            const title = props.eventData.title;
            const textContent = title && title === parsePossibleTitle(props.textData) ? removeTitleFromBody(props.textData) : props.textData;
            console.log(textContent);
            return (
                <LongPostViewer
                    postId={props.eventData._id}
                    postIndex={props.postIndex}
                    displayPhoto={props.visitorDisplayPhoto}
                    username={props.username}
                    visitorUsername={props.visitorUsername}
                    pursuitNames={props.pursuitNames}
                    preferredPostType={props.preferredPostType}
                    largeViewMode={props.largeViewMode}
                    title={title}
                    textData={textContent}
                    isOwnProfile={isOwnProfile}
                    isPostOnlyView={props.isPostOnlyView}
                    eventData={props.eventData}
                    onDeletePost={props.onDeletePost}
                    closeModal={props.closeModal}
                    passDataToModal={props.passDataToModal}
                    onCommentIDInjection={props.onCommentIDInjection}
                    selectedPostFeedType={props.selectedPostFeedType}
                />
            );
        default:
            throw new Error("No content type matched in event-modal.js");
    }
}

export default withFirebase(PostViewerController);