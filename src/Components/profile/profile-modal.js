import React from 'react';
import PostViewerController from "../post/viewer/post-viewer-controller";

const ProfileModal = (props) => {
    return (
        <div className="modal" ref={props.modalRef}>
            <div className="overlay" onClick={props.closeModal}></div>
            <span className="close" onClick={props.closeModal}>X</span>
            {
                props.isModalShowing && props.eventData ?
                    <PostViewerController
                        isOwnProfile={props.visitorUsername === props.targetUsername}
                        targetProfileId={props.targetProfileId}
                        targetIndexUserId={props.targetIndexUserId}
                        visitorUsername={props.visitorUsername}
                        isPostOnlyView={false}
                        postIndex={props.selectedPostIndex}
                        visitorDisplayPhoto={props.smallCroppedDisplayPhoto}
                        preferredPostType={props.preferredPostType}
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
    )
}

export default ProfileModal;