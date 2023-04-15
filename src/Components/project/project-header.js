import React, { useEffect, useState } from 'react';
import AxiosHelper from 'utils/axios';
import { returnUserImageURL, returnContentImageURL } from 'utils/url';
import SimilarProjectInfo from './sub-components/similar-project-info';

const ProjectHeader = (props) => {
    const [relatedProjects, setRelatedProjects] = useState([]);
    const [projectPreviews, setProjectPreviews] = useState([]);
    const [comparatorStatus, setComparatorStatus] = useState("NONE");
    const [toggleChildrenStatus, setChildrenStatus] = useState(false);
    const childrenLength = props.projectMetaData.children?.length ?? 0;
    const ancestorLength = props.projectMetaData.ancestors.length;
    const parentProjectID = props.projectMetaData.ancestors[ancestorLength - 1]?.project_id;
    const coverPhotoKey = props.projectMetaData.cover_photo_key;
    useEffect(() => {
        const status = props.projectMetaData.status;
        const ancestorLength = props.projectMetaData.ancestors.length;
        if (props.projectMetaData.ancestors.length > 0) {
            const parentID = props.projectMetaData.ancestors[ancestorLength - 1].project_id;
            if (parentID) {
                const blocklist = projectPreviews.map(preview => preview.project_id);
                blocklist.push(props.projectMetaData._id);
                AxiosHelper.getSharedParentProjectPreview(parentID, status, blocklist)
                    .then((results) => setProjectPreviews(results.data));
            }
        }
        AxiosHelper.getRelatedProjectPreview(
            props.projectMetaData.project_preview_id,
            props.projectMetaData.labels,
             props.projectMetaData.pursuit)
            .then(results => {
                setRelatedProjects(results.data);
            })

    }, []);

    const clearAll = () => {
        setComparatorStatus("NONE");
    }

    const determineComparatorType = (type) => {
        if (type === comparatorStatus) setComparatorStatus("NONE");
        else if (type === "PARENT") setComparatorStatus("PARENT");
        else if (type === "CHILDREN") setComparatorStatus("CHILDREN");
        else if (type === "RELATED") setComparatorStatus("RELATED");
    }

    const setComparatorText = (type) => {
        if (type === "PARENT") return "Other Series With The Same Parent";
        else if (type === "CHILDREN") return "Series Influenced By This";
    }

    const shouldShowClose = comparatorStatus !== "NONE";
    return (
        <div>
            <div id="projectheader-pursuit">
                <h5>{props.projectMetaData.pursuit}</h5>
            </div>
            <div id="projectheader-hero">
                <h1>{props.titleValue}</h1>
                {props.descriptionValue && <h4>{props.descriptionValue}</h4>}
                {props.projectMetaData.remix && <p>{props.projectMetaData.remix}</p>}
                {props.projectMetaData.status && <h5>Ongoing</h5>}
            </div>
            <div id="projectheader-fork">
                {parentProjectID && <a href={'/c/' + parentProjectID.toString()}>See Predecessor Series</a>}
            </div>
            {coverPhotoKey &&
                <div id='projectheader-cover' >
                    <img alt='cover' src={returnContentImageURL(coverPhotoKey)} /></div>}
            <div id="projectheader-user-meta">
                <a href={'/u/' + props.projectMetaData.username}>
                    <img src={returnUserImageURL(props.projectMetaData.display_photo_key)}></img>
                    <h5>{props.projectMetaData.username}</h5>
                </a>
            </div>
            <div>
                <p>{props.projectMetaData.overview}</p>

            </div>
            <div >
                <div id='projectheader-comparator'>
                    <button
                        id={comparatorStatus === "RELATED" ? 'projectheader-selected' : ''}
                        className={'projectheader-other-button'}
                        onClick={() => determineComparatorType("RELATED")}
                    >
                        Related
                    </button>
                    <button
                        id={comparatorStatus === "CHILDREN" ? 'projectheader-selected' : ''}
                        className={props.projectMetaData.children_length === 0 ?
                            'projectheader-other-button-disabled' : 'projectheader-other-button'}
                        onClick={() => determineComparatorType("CHILDREN")}
                        disabled={props.projectMetaData.children_length === 0}
                    >
                        Series Influenced By This
                    </button>
                    <button
                        id={comparatorStatus === "PARENT" ? 'projectheader-selected' : ''}
                        className={projectPreviews.length === 0 ?
                            'projectheader-other-button-disabled' : 'projectheader-other-button'}
                        onClick={() => determineComparatorType("PARENT")}
                        disabled={projectPreviews.length === 0}
                    >
                        Other Series With The Same Parent
                    </button>

                </div>
                {shouldShowClose &&
                    <button id='projectheader-close' onClick={clearAll}>Close</button>}
                {
                    comparatorStatus === "RELATED" &&
                    <div id='projectheader-previews'>
                        {relatedProjects.map((preview, index) =>
                            <SimilarProjectInfo
                                key={index}
                                preview={preview}
                            />)}
                    </div>
                }
                {
                    comparatorStatus === "PARENT" &&
                    <div id='projectheader-previews'>
                        {projectPreviews.map((preview, index) =>
                            <SimilarProjectInfo
                                key={index}
                                preview={preview}
                            />)}
                    </div>
                }
                {
                    comparatorStatus === "CHILDREN" &&
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

        </div>
    )
}

export default ProjectHeader;