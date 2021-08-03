import React from 'react';
import { POST_VIEWER_MODAL_STATE } from '../constants/flags';
import PostViewerController from "../post/viewer/post-viewer-controller";
import "./profile-modal.scss";

const ProfileModal = (props) => {
    if (props.eventData) {
        return (
            props.returnModalStructure(
                <PostViewerController
                    labels={props.labels}
                    disableCommenting={props.disableCommenting}
                    isOwnProfile={props.visitorUsername === props.targetUsername}
                    targetProfileID={props.targetProfileID}
                    targetIndexUserID={props.targetIndexUserID}
                    visitorUsername={props.visitorUsername}
                    isPostOnlyView={false}
                    postIndex={props.selectedPostIndex}
                    visitorDisplayPhoto={props.smallCroppedDisplayPhoto}
                    preferredPostPrivacy={props.preferredPostPrivacy}
                    postType={props.postType}
                    largeViewMode={true}
                    pursuitNames={props.pursuitNames}
                    eventData={props.eventData}
                    textData={props.textData}
                    closeModal={props.closeModal}
                    onCommentIDInjection={props.onCommentIDInjection}
                />,
                props.closeModal));
    }
    else {
        return null;

    }
}

export default ProfileModal;