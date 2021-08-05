import React from 'react';
import { Link } from 'react-router-dom';
import { NEW_ENTRY_MODAL_STATE, RELATION_MODAL_STATE } from '../../constants/flags';
import './optional-links.scss';

const OptionalLinks = (props) => {
    switch (props.linkType) {
        case (NEW_ENTRY_MODAL_STATE):
            return (
                <div className="optionallinks-action-buttons-container" >
                    <button onClick={() => props.setModal(NEW_ENTRY_MODAL_STATE)}>
                        <h4>+ New Entry</h4>
                    </button>
                </div>
            );
        case (RELATION_MODAL_STATE):
            return (
                <>
                    <Link
                        to={"/u/".concat(props.username)}>
                        <div className="optionallinks-action-buttons-container">
                            <div id="optionallinks-display-photo-container">
                                <img src={props.tinyDisplayPhoto} />
                            </div>
                            <p>{props.username}</p>
                        </div>
                    </Link>
                    <div className="optionallinks-action-buttons-container">
                        <button onClick={() => props.setModal(RELATION_MODAL_STATE)}>
                            <h4>Friends</h4>
                        </button>
                    </div>
                </>
            );
        default:
            throw new Error("Nothing matched in Optional-Links");
    }
}

export default OptionalLinks;