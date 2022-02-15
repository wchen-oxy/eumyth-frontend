import React from 'react';
import { NEW_ENTRY_MODAL_STATE, PEOPLE_SEARCH_STATE, RELATION_MODAL_STATE, WORKS_STATE } from 'utils/constants/flags';
import './optional-links.scss';

const OptionalLinks = (props) => {
    switch (props.linkType) {
        case (NEW_ENTRY_MODAL_STATE):
            return (
                <div className='optionallinks-action-buttons-container' >
                    <button onClick={() => props.setModal(NEW_ENTRY_MODAL_STATE)}>
                        <h4>+ New Entry</h4>
                    </button>
                </div>
            );
        case (PEOPLE_SEARCH_STATE):
            return (
                <a href={'/search'}>
                    <div className='optionallinks-action-buttons-container'>
                        <h4>People Like You</h4>
                    </div>
                </a>
            );

        case (RELATION_MODAL_STATE):
            return (
                <>
                    <a href={'/u/'.concat(props.username)}>
                        <div className='optionallinks-action-buttons-container'>
                            <div id='optionallinks-display-photo-container'>
                                <img src={props.tinyDisplayPhoto} />
                            </div>
                            <p>{props.username}</p>
                        </div>
                    </a>
                    <div className='optionallinks-action-buttons-container'>
                        <button onClick={() => props.setModal(RELATION_MODAL_STATE)}>
                            <h4>Friends</h4>
                        </button>
                    </div>
                </>
            );
        case (WORKS_STATE):
            return (
                <a href={'/works'}>
                    <div className='optionallinks-action-buttons-container'>
                        <h4>Works</h4>
                    </div>
                </a>
            );

        default:
            throw new Error('Nothing matched in Optional-Links');
    }
}

export default OptionalLinks;