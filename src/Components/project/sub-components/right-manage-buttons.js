import React, { useState } from 'react';
import DeleteWindow from './delete-window';
import ForkWindow from './fork-window';
import './right-manage-buttons.scss';

const RightManageButtons = (props) => {
    const [areButtonsShowing, setButtonShow] = useState(false);
    const [isDeletePageShowing, setIsDeletePageShowing] = useState(false);
    const [isForkPageShowing, setIsForkPageShowing] = useState(false);

    const toggleButton = () => {
        setButtonShow(!areButtonsShowing);
    }

    const toggleDelete = () => {
        setIsDeletePageShowing(!isDeletePageShowing);
    }
    const toggleFork = () => {
        setIsForkPageShowing(!isForkPageShowing);
    }

    return (
        <div >
            <div id="rightmanagebuttons-master-button-container">
                <div className='rightmanagebuttons-outer-container'>
                    <button onClick={toggleFork}>
                        Fork Project
                    </button>
                    <button onClick={toggleButton}> ... </button>
                </div>

                {areButtonsShowing &&
                    (<div className='rightmanagebuttons-outer-container'>
                        <button onClick={() => props.onEditExistingProject()}>Edit</button>
                        <button onClick={toggleDelete}>Delete Project</button>
                    </div>)

                }
            </div>
            {isDeletePageShowing &&
                <DeleteWindow
                    userInfo={props.userInfo}
                    projectID={props.projectID}
                    toggleDelete={toggleDelete}
                />
            }
            {isForkPageShowing &&
                <ForkWindow
                    toggleFork={toggleFork}
                    title={props.title}
                    forkData={props.forkData}
                />
            }
        </div >
    );
}


export default RightManageButtons;