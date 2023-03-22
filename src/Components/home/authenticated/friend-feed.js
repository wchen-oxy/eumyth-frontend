import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import AxiosHelper from 'utils/axios';
import { alterRawCommentArray, formatPostText, updateProjectPreviewMap } from 'utils';
import { REGULAR_CONTENT_REQUEST_LENGTH } from 'utils/constants/settings';
import PostController from "components/post/index";
import { POST_VIEWER_MODAL_STATE } from 'utils/constants/flags';
import Modal from './modal';

const FriendFeed = (props) => {
    const [nextOpenPostIndex, setNextOpenPostIndex] = useState(0);
    const [hasMore, setHasMore] = useState(props.following.length !== 0);
    const [feedData, setFeedData] = useState([]);
    const [numOfContent, setNumOfContent] = useState(0);
    const [projectPreviewMap, setProjectPreviewMap] = useState({});

    const [selected, setSelected] = useState(null);
    const [textData, setTextData] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(null);

    useEffect(() => {
        if (hasMore) {
            fetchNextPosts(nextOpenPostIndex)
        }
    }, [])

    const fetchNextPosts = (index) => {
        const posts = props.following;
        const slicedObjectIDs = posts.slice(
            index,
            index + REGULAR_CONTENT_REQUEST_LENGTH);
        const feedLimitReached = slicedObjectIDs.length !== REGULAR_CONTENT_REQUEST_LENGTH
        const nextOpenPostIndex = feedLimitReached ?
            index + slicedObjectIDs.length
            : index + REGULAR_CONTENT_REQUEST_LENGTH;
        const hasMore = index >= posts.length || feedLimitReached;
        return (AxiosHelper
            .returnMultiplePosts(
                slicedObjectIDs,
                true)
            .then((result) => {
                if (result.data) {
                    const posts = result.data.posts
                    setFeedData(feedData.concat(posts));
                    setNextOpenPostIndex(nextOpenPostIndex);
                    setNumOfContent(numOfContent + posts.length)
                    setHasMore(!hasMore);
                }
            })
            .catch((error) => {
                console.log(error);
                alert(error);
            }));
    }

    const handleCommentIDInjection = (postIndex, rootCommentsArray) => {
        setFeedData(alterRawCommentArray(postIndex, rootCommentsArray, feedData))
    }

    const saveProjectPreview = (projectPreview) => {
        if (!projectPreviewMap[projectPreview._id]) {
            let newMap =
                updateProjectPreviewMap(
                    projectPreviewMap,
                    projectPreview
                );
            setProjectPreviewMap(newMap)
        }
    }

    const setModal = (data, text, index) => {
        setSelected(data);
        setTextData(text);
        setSelectedIndex(index);
        props.openMasterModal(POST_VIEWER_MODAL_STATE);
    }

    const closeModal = () => {
        setSelected(null);
        props.closeMasterModal();
    }

    const createFeed = (inputArray, openIndex, viewerObjects, viewerFunctions) => {
        if (!inputArray || inputArray.length === 0) return [];
        let nextOpenPostIndex = openIndex;
        return inputArray.map((feedItem, index) => {
            const formattedTextData = formatPostText(feedItem);
            const viewerObject = {
                key: nextOpenPostIndex++,
                largeViewMode: false,
                textData: formattedTextData,
                eventData: feedItem,
                ...viewerObjects

            }

            return (
                <div key={index} className='returninguser-feed-object friendfeed-object'>
                    <PostController
                        isViewer
                        viewerObject={viewerObject}
                        viewerFunctions={viewerFunctions}
                        authUser={props.authUser}
                        closeModal={closeModal}
                    />
                </div>
            );
        });
    }

    const sharedViewerObjects = {
        isPostOnlyView: false,
        pursuitObjects: props.pursuitObjects,
        projectPreviewMap: projectPreviewMap,
        windowWidth: props.windowWidth
    }
    const viewerFunctions = {
        onCommentIDInjection: handleCommentIDInjection,
        saveProjectPreview: saveProjectPreview,
        setModal: setModal,
        clearModal: closeModal,
    }
    return (
        <div>
            <Modal
                {...sharedViewerObjects}
                authUser={props.authUser}
                modalState={props.modalState}
                viewerFunctions={viewerFunctions}
                selected={selected}
                selectedIndex={selectedIndex}

                returnModalStructure={props.returnModalStructure}
                clearModal={closeModal}
            />
            <div id='returninguser-infinite-scroll'>
                <InfiniteScroll
                    dataLength={numOfContent}
                    next={() => fetchNextPosts(nextOpenPostIndex)}
                    hasMore={hasMore}
                    loader={<h4>Loading...</h4>}
                    endMessage={
                        <p style={{ textAlign: 'center' }}>
                            <b>Yay! You have seen it all</b>
                        </p>}>
                    {createFeed(
                        feedData,
                        nextOpenPostIndex,
                        sharedViewerObjects,
                        viewerFunctions
                    )}
                </InfiniteScroll>
            </div>
        </div>

    );
}

export default FriendFeed;