import React, { useState } from 'react';
import { EDIT_STATE } from 'utils/constants/flags';

const HiddenButtons = (props) => {
    const [isButtonShowing, setButtonShow] = useState(false);
    if (!props.editProjectState &&
        props.isOwnProfile)
        return (
            <div id='hiddenbuttons'>
                <button onClick={() => setButtonShow(!isButtonShowing)}>...</button>
                {isButtonShowing && (
                    <div id='hiddenbuttons-options'>
                        <button onClick={props.onDeletePost}>Remove</button>
                        <button onClick={() => props.onEditClick(EDIT_STATE)}>Edit</button>
                    </div>
                )}
            </div>
        );
    else {
        return null;
    }
}

export default HiddenButtons;