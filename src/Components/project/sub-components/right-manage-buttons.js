import React, { useState } from 'react';
import DeleteWindow from './delete-window';
import './right-manage-buttons.scss';

const RightManageButtons = (props) => {
    const [areButtonsShowing, setButtonShow] = useState(false);
    const [isDeletePageShowing, setIsDeletePageShowing] = useState(false);
    const toggleButton = () => {
        setButtonShow(!areButtonsShowing);
    }

    const toggleDelete = () => {
        setIsDeletePageShowing(!isDeletePageShowing);
    }

    return (
        <div>
            <div className='rightmanagebuttons-centered-container'>
                {areButtonsShowing ?
                    (<div className='rightmanagebuttons-centered-container'>
                        <button onClick={toggleButton}> ... </button>
                        <button onClick={() => props.onEditExistingProject()}>Edit</button>
                        <button onClick={toggleDelete}>Delete Project</button>
                    </div>)
                    : <button onClick={toggleButton}> ... </button>
                }
            </div>
            <div className='rightmanagebuttons-centered-container'>
                <button
                    id='rightmanagebuttons-right-button'
                    onClick={props.copyToClipboard}
                >
                    Copy Post ID
                </button>
                <p> {props.projectID}</p>
            </div>
            {isDeletePageShowing &&
                <DeleteWindow
                    userInfo={props.userInfo}
                    projectID={props.projectID}
                    toggleDelete={toggleDelete}
                />
            }
        </div >
    );
}


export default RightManageButtons;