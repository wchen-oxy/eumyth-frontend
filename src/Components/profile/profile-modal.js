import React from 'react';
import { POST_VIEWER_MODAL_STATE } from 'utils/constants/flags';
 import PostController from "../post/index";
 
const ProfileModal = (props) => {
    if (props.viewerObject.eventData &&
        props.viewerObject.modalState === POST_VIEWER_MODAL_STATE) {
            console.log("Hit");
        return (
            props.returnModalStructure(
                <PostController
                    isViewer
                    viewerObject={props.viewerObject}
                    authUser={props.authUser}
                    closeModal={props.closeModal}

                />
                ,
                props.closeModal));
    }
    else {
        return null;
    }
}

export default ProfileModal;