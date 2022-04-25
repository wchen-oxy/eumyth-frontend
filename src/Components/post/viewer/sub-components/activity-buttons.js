import React from 'react';
import HiddenButtons from './hidden-buttons';
import './activity-buttons.scss';

const ActivityButtons = (props) => {
    return (
        <div id='activitybuttons-main-container'>
            <button onClick={() => window.alert("Just imagine this bookmarks for you.")}> Bookmark</button>
            <button onClick={props.jumpToComment}>Comment</button>
            <HiddenButtons
                editProjectState={props.editProjectState}
                isOwnProfile={props.isOwnProfile}
                onEditClick={props.onEditClick}
                onDeletePost={props.onDeletePost} />
        </div>

    )
}

export default ActivityButtons;