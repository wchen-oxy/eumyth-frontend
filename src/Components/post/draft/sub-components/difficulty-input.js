import React from 'react';

const DifficultyInput = (props) => {
    return (
        <div id='difficultyinput-main'>
            <label>Difficulty</label>
            <div id='difficultyinput-difficulty'>
                <input
                    id='difficultyinput-slider'
                    defaultValue={props.difficulty}
                    type='range'
                    step={1}
                    min={0}
                    max={2}
                    onClick={(e) => props.setDifficulty(e.target.value)}>
                </input>
                <p>{props.displayDifficulty(props.difficulty)}</p>
            </div>
        </div>
    )
}

export default DifficultyInput;