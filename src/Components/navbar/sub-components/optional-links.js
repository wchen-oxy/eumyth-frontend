import React from 'react';
import { NEW_ENTRY_MODAL_STATE, PEOPLE_SEARCH_STATE, RELATION_MODAL_STATE, WORKS_STATE } from 'utils/constants/flags';

const OptionalLinks = (props) => {
    switch (props.linkType) {
        case (NEW_ENTRY_MODAL_STATE):
            return (
                <div className='optionallinks-actions' >
                    <button className="btn-navbar" onClick={() => props.setModal(NEW_ENTRY_MODAL_STATE)}>
                        <h4>+ Add Activity</h4>
                    </button>
                </div>
            );
        case (PEOPLE_SEARCH_STATE):
            return (
                <a href={'/search'}>
                    <div className='optionallinks-actions btn-navbar-div'>
                        <h4>People Like You</h4>
                    </div>
                </a>
            );

        case (RELATION_MODAL_STATE):
            return (
                <>
                    <a href={'/u/'.concat(props.username)}>
                        <div className='optionallinks-actions btn-navbar-div'>
                            <div id='optionallinks-dp'>
                                <img src={props.tinyDisplayPhoto} />
                                <p>{props.username}</p>
                            </div>
                        </div>
                    </a>
                    <div className='optionallinks-actions' >
                        <button className="btn-navbar" onClick={() => props.setModal(RELATION_MODAL_STATE)}>
                            <h4>Friends</h4>
                        </button>
                    </div>
                </>
            );
        case (WORKS_STATE):
            return (
                <a href={'/works'}>
                    <div className='optionallinks-actions btn-navbar-div'>
                        <h4>Published</h4>
                    </div>
                </a>
            );

        default:
            throw new Error('Nothing matched in Optional-Links');
    }
}

export default OptionalLinks;