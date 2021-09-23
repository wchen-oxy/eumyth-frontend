import React from 'react';
import { POST_VIEWER_MODAL_STATE } from '../constants/flags';
import ShortPostViewer from '../post/viewer/short-post';
import "./profile-modal.scss";

const ProfileModal = (props) => {
    if (props.eventData &&
        props.modalState === POST_VIEWER_MODAL_STATE) {
        return (
            props.returnModalStructure(
                <ShortPostViewer
                    projectID={props.projectID}
                    labels={props.labels}
                    disableCommenting={props.disableCommenting}
                    isOwnProfile={props.isOwnProfile}
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
                />
                ,
                props.closeModal));
    }
    else {
        return null;
    }
}

export default ProfileModal;