import React, { useEffect, useState } from 'react';
import AxiosHelper from 'utils/axios';
import { returnUserImageURL } from 'utils/url';
import SimilarProjectInfo from './sub-components/similar-project-info';
import "./project-header.scss";

const ProjectHeader = (props) => {
    const [projectPreviews, setProjectPreviews] = useState([]);
    const [toggleSimilarProjectsStatus, toggleSimilarProjects] = useState(false);
    useEffect(() => {
        const status = props.projectMetaData.status;
        const length = props.projectMetaData.ancestors.length;
        if (props.projectMetaData.ancestors.length > 0) {
            const parentID = props.projectMetaData.ancestors[length - 1].project_id;
            if (parentID) {
                const blocklist = projectPreviews.map(preview => preview.project_id);
                blocklist.push(props.projectMetaData._id);
                AxiosHelper.getSharedParentProjectPreview(parentID, status, blocklist)
                    .then(result => {
                        console.log(result);
                        setProjectPreviews(result.data)
                    })
            }
        }
    }, []);

    return (
        <div>
            <div id="projectheader-hero-text">
                <h1>{props.titleValue}</h1>
                <h4>{props.descriptionValue}</h4>
            </div>
            <div id="projectheader-user-fork">
                {props.priorProjectID && <a href={'/c/' + props.priorProjectID}>See Predecessor Project</a>}
                {props.projectMetaData.remix && <p>{props.projectMetaData.remix}</p>}
            </div>
            <div id="projectheader-user-info-container">
                <a href={'/u/' + props.projectMetaData.username}>
                    <img src={returnUserImageURL(props.projectMetaData.displayPhoto)}></img>
                    <h5>{props.projectMetaData.username}</h5>
                </a>
            </div>
            <button onClick={() => toggleSimilarProjects(!toggleSimilarProjectsStatus)}>
                {toggleSimilarProjectsStatus ? 'Return To Overview' : 'See Other In Progress Work'}
            </button>
            {
                toggleSimilarProjectsStatus ?
                    <div id='projectheader-previews'>
                        {projectPreviews.map((preview, index) =>
                            <SimilarProjectInfo
                                key={index}
                                preview={preview}
                            />)}
                    </div>
                    :
                    <div>
                        <p>{props.projectMetaData.overview}</p>
                        <p>{props.projectMetaData.pursuit}</p>
                    </div>
            }

        </div>
    )
}

export default ProjectHeader;