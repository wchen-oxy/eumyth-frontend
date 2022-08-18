import React from 'react';
import { POST_VIEWER_MODAL_STATE } from 'utils/constants/flags';
import ShortPostViewer from '../post/viewer/short-post';

const ProfileModal = (props) => {
    if (props.eventData &&
        props.modalState === POST_VIEWER_MODAL_STATE) {
        const formattedTextData = props.eventData?.text_data && props.eventData.is_paginated ?
            JSON.parse(props.eventData.text_data) : props.eventData.text_data;
        return (
            props.returnModalStructure(
                <ShortPostViewer
                    authUser={props.authUser}
                    projectID={props.projectID}
                    editProjectState={props.editProjectState}
                    disableCommenting={props.disableCommenting}
                    isPostOnlyView={false}
                    postIndex={props.postIndex}
                    largeViewMode={true}
                    pursuitNames={props.pursuitNames}
                    eventData={props.eventData}
                    closeModal={props.closeModal}
                    onCommentIDInjection={props.onCommentIDInjection}
                    textData={formattedTextData}

                    projectPreviewMap={props.projectPreviewMap}
                    saveProjectPreview={props.saveProjectPreview}
                />
                ,
                props.closeModal));
    }
    else {
        return null;
    }
}

export default ProfileModal;