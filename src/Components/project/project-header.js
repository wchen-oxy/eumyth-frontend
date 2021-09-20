import React from 'react';
import { returnUserImageURL } from '../constants/urls';
import "./project-header.scss";
const ProjectHeader = (props) => {
    return (
        <div>
            <div id="projectheader-hero-text">
                <h1>{props.titleValue}</h1>
                <h4>{props.descriptionValue}</h4>
            </div>
            <div id="projectheader-user-info-container">
                <h5>{props.username}</h5>
                <img src={returnUserImageURL(props.displayPhoto)}></img>
            </div>
        </div>
    )
}

export default ProjectHeader;