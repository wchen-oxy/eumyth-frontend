import React from 'react';
import { POST_VIEWER_MODAL_STATE } from 'utils/constants/flags';
 import PostController from "../post/index";
 
const ProfileModalController = (props) => {
    if (props.viewerObject.eventData &&
        props.modalState === POST_VIEWER_MODAL_STATE) {
        return (
            props.returnModalStructure(
                <PostController
                    isViewer
                    authUser={props.authUser}
                    viewerObject={props.viewerObject}
                    viewerFunctions={props.viewerFunctions}
                    closeModal={props.closeModal}
                />
                ,
                props.closeModal));
    }
    else {
        return null;
    }
}

export default ProfileModalController;