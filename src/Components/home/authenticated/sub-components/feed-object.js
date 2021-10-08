import React from 'react';
import LongPostViewer from 'components/post/viewer/long-post';
import ShortPostViewer from 'components/post/viewer/short-post';
import { SHORT, LONG } from 'utils/constants/flags';

const FeedObject = (props) => {
    const feedItem = props.feedItem;
    if (feedItem.post_format === SHORT) {
        return (
            <ShortPostViewer
                displayPhoto={feedItem.display_photo_key}
                username={feedItem.username}
                pursuits={null}
                preferredPostPrivacy={null}
                textData={feedItem.is_paginated ?
                    JSON.parse(feedItem.text_data) : feedItem.text_data}
                largeViewMode={false}
                isOwnProfile={false}
                eventData={feedItem}
                onDeletePost={null}
            />)
    }
    else if (feedItem.post_format === LONG) return (

        <LongPostViewer
            displayPhoto={feedItem.displayPhoto}
            username={feedItem.username}
            pursuits={feedItem.pursuits}
            preferredPostPrivacy={feedItem.preferredPostPrivacy}
            textData={feedItem.textData}
            isOwnProfile={false}
            eventData={feedItem}
            onDeletePost={null}
        />
    );
};

export default FeedObject;