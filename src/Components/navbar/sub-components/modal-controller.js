import React from 'react';
import PostController from 'components/post/index';
import RelationModal from './relation-modal';
import { NEW_ENTRY_MODAL_STATE, POST_VIEWER_MODAL_STATE, RELATION_MODAL_STATE } from 'utils/constants/flags';

const ModalController = (props) => {
    switch (props.modalState) {
        case (NEW_ENTRY_MODAL_STATE):
            return (
                <PostController
                    authUser={props.authUser}
                    username={props.authUser.username}
                    closeModal={props.closeModal}
                />);
        case (RELATION_MODAL_STATE):
            return (
                <RelationModal
                    username={props.authUser.username}
                    closeModal={props.clearModal} />);
        case (POST_VIEWER_MODAL_STATE):
            return (null);

        default:
            throw Error('Modal Controller: Nothing matched');
    }
}

export default ModalController;