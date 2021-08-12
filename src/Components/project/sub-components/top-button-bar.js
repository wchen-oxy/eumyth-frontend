import React from 'react';
import { PROJECT_MACRO_VIEW_STATE, PROJECT_MICRO_VIEW_STATE, PROJECT_REARRANGE_STATE, PROJECT_SELECT_VIEW_STATE } from '../../constants/flags';
import "./top-button-bar.scss";


const TopButtonBar = (props) => {
    switch (props.barType) {
        case (PROJECT_MACRO_VIEW_STATE):
            return (
                <div id="topbuttonbar-button-bar">
                    <div id="topbuttonbar-left-button-container">
                        <button
                            onClick={props.onNewBackProjectClick}
                        >
                            New
                        </button>
                    </div>
                </div>
            );
        case (PROJECT_MICRO_VIEW_STATE):
            return (
                <div id="topbuttonbar-button-bar">
                    <div id="topbuttonbar-left-button-container">
                        <button onClick={props.onBackClick}>
                            Back
                        </button>
                    </div>

                    <div id="topbuttonbar-right-button-container">
                        <button
                            id="topbuttonbar-right-button"
                            onClick={() => props.copyToClipboard(props.selectedProjectID)}
                        >
                            Copy Post ID
                        </button>
                        <p>  {props.selectedProjectID}</p>
                    </div>
                </div>
            );
        case (PROJECT_SELECT_VIEW_STATE):
            return (
                <div id="topbuttonbar-button-bar">
                    <div id="topbuttonbar-left-button-container">
                        <button onClick={props.onBackClick}>
                            Back
                        </button>
                    </div>

                    <div id="topbuttonbar-right-button-container">
                        <button
                            id="topbuttonbar-right-button"
                            onClick={() => props.handleWindowSwitch("EDIT")}
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