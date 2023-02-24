import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import AxiosHelper from 'utils/axios';
import { formatPostText } from 'utils';
import { REGULAR_CONTENT_REQUEST_LENGTH } from 'utils/constants/settings';
import PostController from "components/post/index";
import { FOLLOWED_FEED } from 'utils/constants/flags';

const FriendFeed = (props) => {
    const [nextOpenPostIndex, setNextOpenPostIndex] = useState(0);
    const [hasMore, setHasMore] = useState(props.feedData.length < props.following.length
        ? true : false);
    const [feedData, setFeedData] = [];

    useEffect(() => {
        const hasFollowingPosts = this.state.feeds.following.length > 0;
        if (hasFollowingPosts) {
            const returnedFollow = AxiosHelper
                .returnMultiplePosts(
                    this.state.feeds.following
                        .slice(0, REGULAR_CONTENT_REQUEST_LENGTH), true)
                .catch((err) => console.log(err))
            returnedFollow.then(
                (results) => {
                    setFeedData(results.data.posts);
                    setNextOpenPostIndex(REGULAR_CONTENT_REQUEST_LENGTH);
                }
            )
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
                    setFeedData(feedData.concat(result.data.posts));
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