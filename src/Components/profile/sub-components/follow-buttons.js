import React from 'react';
import {
    NOT_A_FOLLOWER_STATE,
    FOLLOWED_STATE,
    FOLLOW_REQUESTED_STATE,
    FOLLOW_ACTION,
    UNFOLLOW_ACTION
} from 'utils/constants/flags';
import {
    FOLLOW_BUTTON_TEXT,
    FOLLOWED_BUTTON_TEXT,
    REQUESTED_BUTTON_TEXT
} from 'utils/constants/ui-text';

const FollowButtons = (props) => {
    if (props.isOwner) return (<></>);
    else {
        let text = '';
        let action = null;
        switch (props.followerStatus) {
            case (NOT_A_FOLLOWER_STATE):
                text = FOLLOW_BUTTON_TEXT;
                action = FOLLOW_ACTION;
                break;
            case (FOLLOW_REQUESTED_STATE):
                text = REQUESTED_BUTTON_TEXT;
                action = UNFOLLOW_ACTION;
                break;
            case (FOLLOWED_STATE):
                text = FOLLOWED_BUTTON_TEXT;
                action = UNFOLLOW_ACTION;
                break;
            default:
                break;

        }
        return (
            <div>
                <button onClick={() => props.onFollowClick(action)}>{text}</button>
                {/* <button onClick={props.onOptionsClick}>...</button> */}
            </div>
        )
    }
}

export default FollowButtons;