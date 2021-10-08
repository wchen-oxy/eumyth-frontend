import React, { useState } from 'react';
import { TEMP_PROFILE_PHOTO_URL } from 'utils/constants/urls';
import { returnUserImageURL } from 'utils/url';
import { returnFormattedDate } from 'utils/constants/ui-text';
import { EDIT_STATE } from 'utils/constants/flags';
import './post-header.scss';


const PostHeader = (props) => {
    const [isButtonShowing, setButtonShow] = useState(false);
    const date = props.date ? returnFormattedDate(props.date) : null;
    return (
        <div className='postheader-main-container'>
            <div className='postheader-author-information'>
                <div className='postheader-display-photo-container'>
                    <img src={
                        props.displayPhoto ?
                            returnUserImageURL(props.displayPhoto)
                            :
                            TEMP_PROFILE_PHOTO_URL
                    } />
                </div>
                <div className='postheader-text-information-container'>
                    <h4>{props.username}</h4>
                    {date && <p>{date.month}, {date.day}, {date.year} </p>}
                </div>
            </div>
            {props.isOwnProfile &
                <div id='postheader-main-button-container'>
                    <button onClick={() => setButtonShow(!isButtonShowing)}>...</button>
                    {isButtonShowing && (
                        <div id='postheader-button-pop-up'>
                            <button onClick={props.onDeletePost}>Remove</button>
                            <button onClick={() => props.onEditClick(EDIT_STATE)}>Edit</button>
                        </div>
                    )}
                </div>
            }
        </div>
    )

}

export default PostHeader;