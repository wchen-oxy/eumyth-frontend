import React from 'react';
import ShortPostViewer from "./short-post";
import LongPostViewer from "./long-post";
import { SHORT, LONG } from "../../constants/flags";
import { withFirebase } from "../../../Firebase/index";
import AxiosHelper from "../../../Axios/axios";

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
    const deletePostCallback = () => {
        return AxiosHelper
            .deletePost(
                props.targetProfileID,
                props.targetIndexUserID,
                props.eventData._id, 
                props.eventData.pursuit_category,
                props.eventData.min_duration,
                props.eventData.is_milestone
                )
            .then((result) => console.log(result))
            .catch((err) => {
                console.log(err);
                alert("Something went wrong during deletion");
            });
    }

    const handleDeletePost = () => {
        if (props.eventData.image_data.length) {
            let imageArray = props.eventData.image_data;
            if (props.eventData.cover_photo_key) {
                imageArray.push(props.eventData.cover_photo_key)
            }
            return AxiosHelper.deleteManyPhotosByKey(imageArray)
                .then((results) => deletePostCallback());
        }
        else {
            return deletePostCallback();
        }
    }

    const isOwnProfile = (props.eventData.username === props.visitorUsername);
    const textData = props.textData && props.eventData.isPaginated ?
        JSON.parse(props.textData) : props.textData;
    switch (props.eventData.post_format) {
        case (SHORT):
            return (
                <ShortPostViewer
                    postID={props.eventData._id}
                    postIndex={props.postIndex}
                    displayPhoto={props.visitorDisplayPhoto}
                    visitorUsername={props.visitorUsername}
                    pursuitNames={props.pursuitNames}
                    preferredPostPrivacy={props.preferredPostPrivacy}
                    textData={textData}
                    largeViewMode={props.largeViewMode}
                    isOwnProfile={isOwnProfile}
                    isPostOnlyView={props.isPostOnlyView}
                    eventData={props.eventData}
                    onDeletePost={handleDeletePost}
                    closeModal={props.closeModal}
                    passDataToModal={props.passDataToModal}
                    onCommentIDInjection={props.onCommentIDInjection}
                    selectedPostFeedType={props.selectedPostFeedType}
                    disableCommenting={props.disableCommenting}
                />
            );
        case (LONG):
            const title = props.eventData.title;
            const textContent = title && title === parsePossibleTitle(props.textData)
                ? removeTitleFromBody(props.textData) : props.textData;
            return (
                <LongPostViewer
                    postID={props.eventData._id}
                    postIndex={props.postIndex}
                    displayPhoto={props.visitorDisplayPhoto}
                    visitorUsername={props.visitorUsername}
                    pursuitNames={props.pursuitNames}
                    preferredPostPrivacy={props.preferredPostPrivacy}
                    largeViewMode={props.largeViewMode}
                    title={title}
                    textData={textContent}
                    isOwnProfile={isOwnProfile}
                    isPostOnlyView={props.isPostOnlyView}
                    eventData={props.eventData}
                    onDeletePost={handleDeletePost}
                    closeModal={props.closeModal}
                    passDataToModal={props.passDataToModal}
                    onCommentIDInjection={props.onCommentIDInjection}
                    selectedPostFeedType={props.selectedPostFeedType}
                    disableCommenting={props.disableCommenting}

                />
            );
        default:
            throw new Error("No content type matched in event-modal.js");
    }
}

export default withFirebase(PostViewerController);