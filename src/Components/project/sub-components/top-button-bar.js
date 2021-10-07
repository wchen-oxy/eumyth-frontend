import React from 'react';
import { PROJECT_CONTENT_ONLY_VIEW_STATE, PROJECT_MACRO_VIEW_STATE, PROJECT_MICRO_VIEW_STATE, PROJECT_REARRANGE_STATE, PROJECT_SELECT_VIEW_STATE } from '../../constants/flags';
import RightManageButtons from './right-manage-buttons';
import "./top-button-bar.scss";


const TopButtonBar = (props) => {
    switch (props.barType) {
        case (PROJECT_CONTENT_ONLY_VIEW_STATE):
            return (
                <div id="topbuttonbar-right-only-button-bar">
                    <RightManageButtons
                        copyToClipboard={props.copyToClipboard}
                        selectedProjectID={props.selectedProjectID}
                        onEditExistingProject={props.onEditExistingProject}
                    />
                </div>
            )
        case (PROJECT_MACRO_VIEW_STATE):
            return (
                <div >
                    <div id="topbuttonbar-left-button-container">
                        <button onClick={props.onNewProjectSelect} >
                            New
                        </button>
                    </div>
                </div>
            );
        case (PROJECT_MICRO_VIEW_STATE):
            return (
                <div id="topbuttonbar-dual-button-bar">
                    <div id="toepbuttonbar-left-button-container">
                        <button onClick={props.onBackClick}>
                            Back
                        </button>
                    </div>

                    <div id="topbuttonbar-right-button-container">
                        <RightManageButtons
                            copyToClipboard={props.copyToClipboard}
                            selectedProjectID={props.selectedProjectID}
                            onEditExistingProject={props.onEditExistingProject}
                        />
                    </div>
                </div>
            );
        case (PROJECT_SELECT_VIEW_STATE):

            return (
                <div id="topbuttonbar-dual-button-bar">
                    <div id="topbuttonbar-left-button-container">
                        <button onClick={props.onBackClick}>
                            Back
                        </button>
                    </div>

                    <div id="topbuttonbar-right-button-container">
                        <button
                            id="topbuttonbar-right-button"
                            onClick={() => {
                                if (props.selectStage === 1) {
                                    props.handleWindowSwitch(2)
                                }
                                else if (props.selectStage === 2) {
                                    props.handleWindowSwitch("EDIT")
                                }
                                else {
                                    throw new Error("Missing selectState")
                                }
                            }}
                        >
                            Next
                        </button>
                    </div>
                </div >
            );
        case (PROJECT_REARRANGE_STATE):
            return (
                <div className="">
                    <button onClick={props.onBackClick}>
                        Back
                    </button>
                    <button
                        onClick={() => props.handleWindowSwitch("REVIEW")}
                    >
                        Finalize
                    </button>
                </div>
            );
        default:
            throw new Error("No matching barType");
    }

}

export default TopButtonBar;