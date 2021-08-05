import React from 'react';
import { displayProgressionType } from "../../../constants/ui-text";

const ProgressInput = (props) => {
    return (
        <div>
            <label>Progress</label>
            <p>{displayProgressionType(props.progression)}</p>
            <input
                defaultValue={props.progression}
                type="range"
                step={1}
                min={0}
                max={2}
                onClick={(e) => props.setProgression(e.target.value)}>
            </input>
        </div>
    );
}

export default ProgressInput;