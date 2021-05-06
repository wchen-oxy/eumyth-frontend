import React from 'react';
import PostViewerController from "../post/viewer/post-viewer-controller";
import "./profile-modal.scss";

const ProfileModal = (props) => {
    return (
        <div className="modal" ref={props.modalRef}>
            <div className="overlay" onClick={props.closeModal}></div>
            <span className="close" onClick={props.closeModal}>X</span>
            <div id="profilemodal-window-reset">
                {
                    props.isModalShowing && props.eventData ?
                        <PostViewerController
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
                        :
                        <></>
                }
            </div>
        </div>
    )
}

export default ProfileModal;