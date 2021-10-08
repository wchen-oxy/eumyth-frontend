import React from 'react';
import { POST_VIEWER_MODAL_STATE } from 'utils/constants/flags';
import ShortPostViewer from '../post/viewer/short-post';
import './profile-modal.scss';

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
                    disableCommenting={props.disableCommenting}
                    isPostOnlyView={false}
                    postIndex={props.selectedPostIndex}
                    postType={props.postType}
                    largeViewMode={true}
                    pursuitNames={props.pursuitNames}
                    eventData={props.eventData}
                    closeModal={props.closeModal}
                    onCommentIDInjection={props.onCommentIDInjection}
                    textData={formattedTextData}
                />
                ,
                props.closeModal));
    }
    else {
        return null;
    }
}

export default ProfileModal;