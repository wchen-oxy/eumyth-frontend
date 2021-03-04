import React, { useState } from 'react';
import { returnUserImageURL } from "../../../constants/urls";
import { returnFormattedDate } from "../../../constants/ui-text";

import "./post-header.scss";


const EDIT = "EDIT";
const PostHeader = (props) => {
    const [isButtonShowing, setButtonShow] = useState(false);
    const date = props.date ? returnFormattedDate(props.date) : null;

    const renderButtons = () => {
        const buttonPopUp = isButtonShowing ? (
            <div id="postheader-button-pop-up">
                <button onClick={props.onDeletePost}>Remove</button>
                <button onClick={() => props.onEditClick(EDIT)}>Edit</button>
            </div>
        ) : <></>;

        return (
            <div id="postheader-main-button-container">
                <button onClick={() => setButtonShow(!isButtonShowing)}>...</button>
                {buttonPopUp}
            </div>
        );
    }
    return (
        <div className="postheader-main-container">
            <div className="postheader-author-information">
                <div className="postheader-display-photo-container">
                    <img src={returnUserImageURL(props.displayPhoto)} />
                </div>
                <div className="postheader-text-information-container">
                    <h4>{props.username}</h4>
                    {date ? <p>{date.month}, {date.day}, {date.year} </p> : <></>}
                </div>
            </div>
            {props.isOwnProfile ? renderButtons() : null}
        </div>
    )

}

export default PostHeader;