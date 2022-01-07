import React from 'react';
import './project-utility-buttons.scss';

const ProjectUtilityButtons = (props) => {
    return (
        <div id='projectutilitybuttons-container'>
            <button onClick={() => props.onSelectAll(true)}>Select All Visible Posts</button>
            <button onClick={() => props.onSelectAll(false)}>Unselect All Posts</button>
        </div>
    )
}

export default ProjectUtilityButtons;