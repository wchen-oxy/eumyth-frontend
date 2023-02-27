import React from 'react';
import PostController from "components/post/index";
import { formatPostText } from 'utils';
import { POST_VIEWER_MODAL_STATE } from 'utils/constants/flags';


const Modal = (props) => {
    if (props.modalState === POST_VIEWER_MODAL_STATE &&
        props.selected) {
        const formattedTextData = formatPostText(props.selected);

        const viewerObject = {
            key: props.selectedIndex,
            largeViewMode: true,
            textData: formattedTextData,
            isPostOnlyView: props.isPostOnlyView,
            eventData: props.selected,
            selectedIndex: props.selectedIndex,
            pursuitObjects: props.pursuitObjects,
            projectPreviewMap: props.projectPreviewMap
        };
         const content = (
            <PostController
                isViewer
                viewerObject={viewerObject}
                viewerFunctions={props.viewerFunctions}
                authUser={props.authUser}
                closeModal={props.clearModal}
            />
        );
        return props.returnModalStructure(
            content,
            props.clearModal
        );
    }
    else {
        return null;
    }
}

export default Modal;