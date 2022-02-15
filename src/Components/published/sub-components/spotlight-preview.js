import React, { useEffect, useState } from 'react';
import AxiosHelper from 'utils/axios';
import SpotlightEvent from './event';
import ShortPostViewer from 'components/post/viewer/short-post.js';
import { returnUserImageURL } from 'utils/url';
import { POST_VIEWER_MODAL_STATE, SPOTLIGHT_POST } from 'utils/constants/flags';
import './spotlight-preview.scss';
import EventLabels from 'components/timeline/sub-components/event-labels';
import SpotlightMeta from './spotlight-meta';
import ProjectVote from './project-vote';

const OVERVIEW_STATE = 'OVERVIEW_STATE';
const STAT_STATE = "STAT_STATE";
const SpotlightPreview = (props) => {
    const [loadedPosts, setLoadedPosts] = useState([]);
    const [selectedContent, setSelectedContent] = useState(null);
    const [metaState, setMetaState] = useState(OVERVIEW_STATE);

    useEffect(() => {
        if (props.project.post_ids.length > 0) {
            console.log(props.project.post_ids.slice(2))
            AxiosHelper.returnMultiplePosts(
                props.project.post_ids.slice(0, 2), false)
                .then((results => {
                    console.log(results.data);
                    if (results.data.posts.length > 0) {
                        setLoadedPosts(results.data.posts)
                    }
                }))
        }
    }, [props.project]);

    const setModal = () => {
        props.openMasterModal(POST_VIEWER_MODAL_STATE);
    }

    const clearModal = () => {
        setSelectedContent(null);
        props.closeMasterModal();
    }


    const renderModal = () => {
        if (props.modalState === POST_VIEWER_MODAL_STATE &&
            selectedContent) {
            const formattedTextData = selectedContent?.text_data && selectedContent.is_paginated ?
                JSON.parse(selectedContent.text_data) : selectedContent.text_data;

            const content = (
                <ShortPostViewer
                    authUser={props.authUser}
                    key={selectedContent._id}
                    largeViewMode={true}
                    isPostOnlyView={false}
                    postType={SPOTLIGHT_POST}
                    eventData={selectedContent}
                    textData={formattedTextData}
                />
            )
            return props.returnModalStructure(
                content,
                clearModal
            )
        }
        else {
            return null;
        }
    }

    const handleEventClick = (selectedContent) => {
        setSelectedContent(selectedContent);
        setModal()
    }

    return (
        <div className='spotlightpreview-main-container'>
            <a href={"/c/" + props.project._id}><h3>{props.project.title}</h3></a>
            {props.project.cover_photo_key &&
                <div className='spotlightpreview-cover-container'>
                    <img src={returnUserImageURL(props.project.cover_photo_key)} />
                </div>
            }
            <button disabled={metaState === OVERVIEW_STATE} onClick={() => setMetaState(OVERVIEW_STATE)} >
                Overview </button>
            <button disabled={metaState === STAT_STATE} onClick={() => setMetaState(STAT_STATE)} >
                Stats
            </button>
            {props.project.pursuit && <p>{props.project.pursuit}</p>}

            {props.project.overview &&
                metaState === OVERVIEW_STATE ?
                <div>
                    <p>{props.project.overview}</p>
                    {props.project.children_length !== 0
                        &&
                        <p> Children: {props.project.children_length} </p>}
                </div>
                :
                <SpotlightMeta
                    parent={props.project.parent}
                    ancestors={props.project.ancestors}
                    startDate={props.project.start_date}
                    endDate={props.project.end_date}
                    minDuration={props.project.min_duration}
                    postListLength={props.project.postListLength}
                />
            }
            <div>
                <div className='spotlightpreview-display-container'>
                    <img src={returnUserImageURL(props.project.display_photo_key)} />
                    <a className='spotlightpreview-username' href={'/u/' + props.project.username}>
                        <h4>{props.project.username}</h4>
                    </a>
                </div>
            </div>
            <div>
                <ProjectVote
                    projectID={props.project._id}
                    userPreviewID={props.authUser.userPreviewID}
                    bookmarks={props.project.bookmarks}
                    likes={props.project.likes}
                    dislikes={props.project.dislikes}
                />
            </div>
            <div>
                <EventLabels
                    labels={props.project.labels}
                />
            </div>
            {/* <div className='spotlightpreview-posts'>
                {loadedPosts.length > 0 && loadedPosts.map(
                    post =>
                        <SpotlightEvent post={post} onEventClick={handleEventClick} />
                )}
            </div> */}
            {/* {renderModal()} */}
        </div>

    )
}

export default SpotlightPreview;