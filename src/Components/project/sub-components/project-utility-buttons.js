import React from 'react';

const ProjectUtilityButtons = (props) => {
    return (
        <div id='projectutilitybuttons'>
            <button onClick={() => props.onSelectAll(true)}>Select All Visible Posts</button>
            <button onClick={() => props.onSelectAll(false)}>Unselect All Posts</button>
        </div>
    )
}

export default ProjectUtilityButtons;