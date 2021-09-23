import React, { useState } from 'react';
import "./right-manage-buttons.scss";

const RightManageButtons = (props) => {
    const [areButtonsShowing, setButtonShow] = useState(false);
    const toggleButton = () => {
        setButtonShow(!areButtonsShowing);
    }
    console.log("adsfasdf");

    return (
        <div>
            <div className="rightmanagebuttons-centered-container">
                {areButtonsShowing ?
                    (<div className="rightmanagebuttons-centered-container">
                        <button onClick={toggleButton}> ... </button>
                        <button onClick={() => props.onEditExistingProject()}>Edit</button>
                        <button>Remove</button>
                    </div>)
                    : <button onClick={toggleButton}> ... </button>
                }
            </div>
            <div className="rightmanagebuttons-centered-container">
                <button
                    id="rightmanagebuttons-right-button"
                    onClick={() => props.copyToClipboard(props.selectedProjectID)}
                >
                    Copy Post ID
                </button>
                <p> {props.selectedProjectID}</p>
            </div>
        </div >
    );
}


export default RightManageButtons;