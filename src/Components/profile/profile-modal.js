import React from 'react';
import { AuthUserContext } from '../session';
import PostViewerController from "../post/viewer/post-viewer-controller";
import "./profile-modal.scss";

const ProfileModal = (props) => {
    if (props.eventData) {
        return (
            props.returnModalStructure(
                <AuthUserContext.Consumer>
                    {
                        authUser =>
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
                            />
                    }


                </AuthUserContext.Consumer>
                ,
                props.closeModal));
    }
    else {
        return null;

    }
}

export default ProfileModal;