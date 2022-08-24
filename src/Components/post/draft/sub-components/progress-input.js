import React from 'react';
import { displayProgressionType } from "../../../../utils/constants/ui-text";

const ProgressInput = (props) => {
    return (
        <div id='progressinput'>
            <label>Progress</label>
            <div id='progressinput-progression'>
                <input
                    id='progressinput-slider'
                    defaultValue={props.progression}
                    type="range"
                    step={1}
                    min={0}
                    max={2}
                    onClick={(e) => props.setProgression(e.target.value)}>
                </input>
                <p>{displayProgressionType(props.progression)}</p>
            </div>
        </div>
    );
}

export default ProgressInput;