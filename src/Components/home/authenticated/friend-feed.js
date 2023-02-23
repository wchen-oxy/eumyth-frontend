import React, { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import AxiosHelper from 'utils/axios';
import { formatPostText } from 'utils';
import { REGULAR_CONTENT_REQUEST_LENGTH } from 'utils/constants/settings';
import PostController from "components/post/index";

const FriendFeed = (props) => {
    const [nextOpenPostIndex, setNextOpenPostIndex] = useState(0);
    const [hasMore, setHasMore] = useState(props.feedData.length < props.following.length
        ? true : false);

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
                    props.setFeedData(props.feedData.concat(result.data.posts));
                    setNextOpenPostIndex(nextOpenPostIndex);
                    setHasMore(!hasMore);
                }
            })
            .catch((error) => {
                console.log(error);
                alert(error);
            }));
    }

    const createFeed = (inputArray, openIndex) => {
        if (!inputArray || inputArray.length === 0) return [];
        let nextOpenPostIndex = openIndex;
        return inputArray.map((feedItem, index) => {
            const formattedTextData = formatPostText(feedItem);
            const viewerObject = {
                key: nextOpenPostIndex++,
                index: index,
                largeViewMode: false,
                textData: formattedTextData,
                isPostOnlyView: false,
                pursuitNames: props.pursuitObjects.names,
                projectPreviewMap: props.projectPreviewMap,
                eventData: feedItem,

                onCommentIDInjection: props.onCommentIDInjection,
                saveProjectPreview: props.saveProjectPreview,
                passDataToModal: props.passDataToModal,
            }
            return (
                <div key={index} className='returninguser-feed-object'>
                    <PostController
                        isViewer
                        viewerObject={viewerObject}
                        authUser={props.authUser}
                        closeModal={props.clearModal}
                    />
                </div>
            );
        });
    }
    return (
        <div id='returninguser-infinite-scroll'>
            <InfiniteScroll
                dataLength={nextOpenPostIndex}
                next={() => fetchNextPosts(nextOpenPostIndex)}
                hasMore={hasMore}
                loader={<h4>Loading...</h4>}
                endMessage={
                    <p style={{ textAlign: 'center' }}>
                        <b>Yay! You have seen it all</b>
                    </p>}>
                {createFeed(props.feedData, nextOpenPostIndex)}
            </InfiniteScroll>
        </div>
    );
}

export default FriendFeed;