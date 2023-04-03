import React, { useState } from 'react';
import { EDIT_STATE } from 'utils/constants/flags';

const HiddenButtons = (props) => {
    const [isButtonShowing, setButtonShow] = useState(false);
    if (!props.editProjectState &&
        props.isOwnProfile)
        return (
            <div>
                <div id='hiddenbuttons-overlay' onClick={() => setButtonShow(!isButtonShowing)}></div>
                <div id='hiddenbuttons'>
                    <button onClick={() => setButtonShow(!isButtonShowing)}>...</button>
                    {isButtonShowing && (
                        <div id='hiddenbuttons-options'>
                            <button
                                id='hiddenbuttons-options-edit'
                                onClick={() => props.onEditClick(2)}>
                                Edit
                            </button>
                            <button
                                id='hiddenbuttons-options-remove'
                                onClick={props.onDeletePost}>
                                Remove
                            </button>
                        </div>
                    )}
                </div>

            </div>
        );
    else {
        return null;
    }
}

export default HiddenButtons;