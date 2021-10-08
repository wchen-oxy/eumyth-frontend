import React from 'react';
import { returnUserImageURL } from 'utils/url';
import "./project-header.scss";
const ProjectHeader = (props) => {
    return (
        <div>
            <div id="projectheader-hero-text">
                <h1>{props.titleValue}</h1>
                <h4>{props.descriptionValue}</h4>
            </div>
            <div id="projectheader-user-fork">
                {props.priorProjectID && <a href={'/c/' + props.priorProjectID}>See Predecessor Project</a>}
            </div>
            <div id="projectheader-user-info-container">
                <h5>{props.username}</h5>
                <img src={returnUserImageURL(props.displayPhoto)}></img>
            </div>
        </div>
    )
}

export default ProjectHeader;