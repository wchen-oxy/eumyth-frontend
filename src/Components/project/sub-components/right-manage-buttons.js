import React, { useState } from 'react';
import { POST_VIEWER_MODAL_STATE } from 'utils/constants/flags';
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

    const hiddenButtons = props.isOwner ?
        (
            <div className='rightmanagebuttons-inner-container'>
                <button onClick={() => alert("Temporary Report Button")}>Report</button>
                <button onClick={() => props.onEditExistingProject()}>Edit</button>
                <button onClick={toggleDelete}>Delete Series</button>
            </div>
        )
        :
        (
            <div className='rightmanagebuttons-inner-container'>
                <button onClick={() => alert("Temporary Report Button")}>Report</button>
            </div>
        );
    const openModal = () => {
        props.openMasterModal(POST_VIEWER_MODAL_STATE);
        toggleFork();
    }

    const closeModal = () => {
        toggleFork();
        props.closeMasterModal();
    }
    return (
        <div >
            <div id="rightmanagebuttons-master-button-container">
                <div className='rightmanagebuttons-outer-container'>
                    {props.isOwner &&
                        <button
                            title={props.status === "PUBLISHED" ?
                                "You've Already Published This" : "Publish Your Series So The World Can See"}
                            className="rightmanagebuttons-buttons"
                            disabled={props.status === "PUBLISHED"}
                            onClick={() => props.onPublish(props.projectID)}>
                            {props.status === "PUBLISHED" ? "Published" : "Publish"}
                        </button>
                    }
                    <button
                        title="Reference This Project"
                        className="rightmanagebuttons-buttons"
                        onClick={openModal}
                    >
                        Create Branch
                    </button>
                    <div>
                        <button className="rightmanagebuttons-buttons" onClick={toggleButton}> ... </button>
                        {areButtonsShowing && hiddenButtons}
                    </div>
                </div>
            </div>
            {isDeletePageShowing &&
                <DeleteWindow
                    userInfo={props.userInfo}
                    projectID={props.projectID}
                    toggleDelete={toggleDelete}
                />
            }
            {isForkPageShowing &&
                props.returnModalStructure(
                    <ForkWindow
                        toggleFork={toggleFork}
                        title={props.title}
                        forkData={props.forkData}
                        closeModal={closeModal}
                    />,
                    closeModal)
            }
        </div >
    );
}


export default RightManageButtons;