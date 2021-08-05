import React from 'react';

const DifficultyInput = (props) => {


    return (
        <div>
            <label>Difficulty</label>
            <p>{props.displayDifficulty(props.difficulty)}</p>
            <input
                defaultValue={props.difficulty}
                type="range"
                step={1}
                min={0}
                max={2}
                onClick={(e) => props.setDifficulty(e.target.value)}>
            </input>
        </div>
    )
}

export default DifficultyInput;