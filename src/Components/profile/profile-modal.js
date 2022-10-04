import React from 'react';
import { POST_VIEWER_MODAL_STATE } from 'utils/constants/flags';
import ShortPostViewer from '../post/viewer/short-post';
import PostController from "../post/index";
import { formatPostText } from 'utils';

const ProfileModal = (props) => {
    if (props.eventData &&
        props.modalState === POST_VIEWER_MODAL_STATE) {
        const formattedTextData = formatPostText(props.eventData)

        const viewerObject = {
            largeViewMode: true,
            textData: formattedTextData,
            isPostOnlyView: false,
            pursuitNames: props.pursuitNames,
            eventData: props.eventData,
            projectPreviewMap: props.projectPreviewMap,
            
            disableCommenting: props.disableCommenting,
            projectID: props.projectID,
            postIndex: props.postIndex,
            editProjectState: props.editProjectState,
            onCommentIDInjection: props.onCommentIDInjection,
            saveProjectPreview: props.saveProjectPreview
        }
        return (
            props.returnModalStructure(
                <PostController
                    isViewer
                    viewerObject={viewerObject}
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