import React, { useEffect, useState } from 'react';
import AxiosHelper from 'utils/axios';
import { returnUserImageURL, returnContentImageURL } from 'utils/url';
import SimilarProjectInfo from './sub-components/similar-project-info';
import "./project-header.scss";

const ProjectHeader = (props) => {
    const [projectPreviews, setProjectPreviews] = useState([]);
    const [comparatorStatus, setComparatorStatus] = useState("PARENT");
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
                    .then(result => {
                        setProjectPreviews(result.data)
                    })
            }
        }

    }, []);

    const determineComparatorType = (type) => {
        if (type === "PARENT") setComparatorStatus("CHILDREN");
        else if (type === "CHILDREN") setComparatorStatus("PARENT");
    }

    const setComparatorText = (type) => {
        if (type === "PARENT") return "Other Series With The Same Parent";
        else if (type === "CHILDREN") return "See How This Influenced Others";
    }
    return (
        <div>
            <div id="projectheader-pursuit-container">
                <h5>{props.projectMetaData.pursuit}</h5>
            </div>
            <div id="projectheader-hero-text">
                <h1>{props.titleValue}</h1>
                {props.descriptionValue && <h4>{props.descriptionValue}</h4>}
                {props.projectMetaData.status && <h6>Ongoing</h6>}
            </div>
            <div id="projectheader-user-fork">
                {parentProjectID && <a href={'/c/' + parentProjectID.toString()}>See Predecessor Series</a>}
                {props.projectMetaData.remix && <p>{props.projectMetaData.remix}</p>}
            </div>
            {coverPhotoKey &&
                <div id='projectheader-cover-container' >
                    <img alt='cover' src={returnContentImageURL(coverPhotoKey)} /></div>}
            <div id="projectheader-user-info-container">
                <a href={'/u/' + props.projectMetaData.username}>
                    <img src={returnUserImageURL(props.projectMetaData.display_photo_key)}></img>
                    <h5>{props.projectMetaData.username}</h5>
                </a>
            </div>
            <div>
                <p>{props.projectMetaData.overview}</p>

            </div>
            <div >
                <div id='projectheader-comparator-button-container'>
                    <button onClick={() => determineComparatorType(comparatorStatus)}>
                        {setComparatorText(comparatorStatus)}
                    </button>
                </div>
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