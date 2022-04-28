import React, { useEffect, useState } from 'react';
import AxiosHelper from 'utils/axios';
import { returnUserImageURL } from 'utils/url';
import SimilarProjectInfo from './sub-components/similar-project-info';
import "./project-header.scss";

const ProjectHeader = (props) => {
    const [projectPreviews, setProjectPreviews] = useState([]);
    const [toggleSimilarProjectsStatus, setSimilarProjects] = useState(false);
    const [toggleChildrenStatus, setChildrenStatus] = useState(false);
    const childrenLength = props.projectMetaData.children?.length ?? 0;
    const ancestorLength = props.projectMetaData.ancestors.length;
    const parentProjectID = props.projectMetaData.ancestors[ancestorLength - 1]?.project_id;
    useEffect(() => {
        const status = props.projectMetaData.status;
        const ancestorLength = props.projectMetaData.ancestors.length;
        if (props.projectMetaData.ancestors.length > 0) {
            const parentID = props.projectMetaData.ancestors[ancestorLength - 1].project_id;
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
                {parentProjectID && <a href={'/c/' + parentProjectID.toString()}>See Predecessor Project</a>}
                {props.projectMetaData.remix && <p>{props.projectMetaData.remix}</p>}
            </div>
            <div id="projectheader-user-info-container">
                <a href={'/u/' + props.projectMetaData.username}>
                    <img src={returnUserImageURL(props.projectMetaData.displayPhoto)}></img>
                    <h5>{props.projectMetaData.username}</h5>
                </a>
            </div>
            {projectPreviews.length > 0 &&
                <button onClick={() => setSimilarProjects(!toggleSimilarProjectsStatus)}>
                    {toggleSimilarProjectsStatus ? 'Return To Overview' : 'See Other Threads With The Same Parent'}
                </button>}
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
            <button
                title={childrenLength === 0 ? "No Children Threads" : "Show Threads Directly Inspired By This Thread"}
                disabled={childrenLength === 0}
                onClick={() => setChildrenStatus(!toggleChildrenStatus)}>
                {toggleChildrenStatus ? "Hide Children Threads" : "Show Children Threads"}
            </button>
            {
                toggleChildrenStatus &&
                <div id='projectheader-previews'>
                    {childrenLength > 0 && props.projectMetaData.children.map((preview, index) =>
                        <SimilarProjectInfo
                            key={index}
                            preview={preview}
                        />)
                    }
                </div>
            }
        </div>
    )
}

export default ProjectHeader;