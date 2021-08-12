import React from 'react';

const ProjectHeader = (props) => {
    return (
        <div>
            <h1>{props.titleValue}</h1>
            <h4>{props.descriptionValue}</h4>
        </div>
    )
}

export default ProjectHeader;