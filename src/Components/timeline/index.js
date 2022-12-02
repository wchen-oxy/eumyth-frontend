import _, { slice } from 'lodash';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import AxiosHelper from 'utils/axios';
import { DYNAMIC, POST, PROJECT, PROJECT_EVENT } from 'utils/constants/flags';
import { validateFeedIDs } from 'utils/validator';

const endMessage = (
    <div>
        <br />
        <p style={{ textAlign: 'center' }}>
            Yay! You have seen it all
        </p>
    </div>
)

class Timeline extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props)
        this.state = {
            feedID: this.props.feedID,
            nextOpenPostIndex: 0,
            numOfFeedItems: 0,


        }
        this.decideInfiniteScroller = this.decideInfiniteScroller.bind(this);
        this.debounceFetch = _.debounce(() => this.fetchNextPosts(), 10)
        this.fetchNextPosts = this.fetchNextPosts.bind(this);
        this.decideAPICall = this.decideAPICall.bind(this);
        this.handleReturnedContent = this.handleReturnedContent.bind(this);
        this.loadFeedMetaInfo = this.loadFeedMetaInfo.bind(this);
    }

    componentDidUpdate() {
        if (this.props.contentType === DYNAMIC) return;
        if (this.props.feedID !== this.state.feedID) {
            this.setState({ feedID: this.props.feedID, nextOpenPostIndex: 0 },
                () => {
                    if (this.state.nextOpenPostIndex < this.props.allPosts.length && this.props.allPosts.length > 0) {
                        this.debounceFetch();
                    }
                })
        }
    }

    componentDidMount() {
        this._isMounted = true;
        if (this.props.contentType === DYNAMIC) return;

        validateFeedIDs(this.props.allPosts);
        if (this.props.allPosts.length > 0 && this.props.hasMore) {
            this.debounceFetch();
        }
        else {
            this.props.shouldPull(false);
        }
    }

    loadFeedMetaInfo() {
        const slicedObjectIDs = this.props.allPosts.slice(
            this.state.nextOpenPostIndex,
            this.state.nextOpenPostIndex + this.props.requestLength);
            console.log(this.state.numOfFeedItems, this.props.allPosts.length);
        const hasCachedContentOverflowed = this.state.numOfFeedItems > this.props.allPosts.length;
        const endOfContent = this.state.numOfFeedItems + this.props.requestLength >= this.props.numOfContent;
        const nextOpenPostIndex = this.state.nextOpenPostIndex + slicedObjectIDs.length;
        return { slicedObjectIDs, nextOpenPostIndex, hasCachedContentOverflowed, endOfContent };
    }

    fetchNextPosts() {
        this.debounceFetch.cancel();
        if (this.props.contentType === DYNAMIC) {
            AxiosHelper.searchProject(
                this.props.pursuitObject,
                this.props.resultsIDList,
                this.props.requestQuantity,
                this.props.submittingIndexUserID
            )
                .then((results) => {
                    const nextOpenPostIndex =
                        this.state.nextOpenPostIndex + results.length
                    this.setState({ nextOpenPostIndex }, this.handleReturnedContent(results.data));
                })
        }
        else if (
            this.props.contentType === PROJECT ||
            this.props.contentType === POST ||
            this.props.contentType === PROJECT_EVENT) {
            const metaInfo = this.loadFeedMetaInfo();
            if (metaInfo.endOfContent) this.props.shouldPull(false);
            this.setState({ nextOpenPostIndex: metaInfo.nextOpenPostIndex },
                () => {
                    this.decideAPICall(
                        metaInfo.slicedObjectIDs,
                        metaInfo.hasCachedContentOverflowed,
                        this.props.indexUserID,
                        this.props.requestLength)
                        .then((results) =>
                            this.handleReturnedContent(results.data, metaInfo.slicedObjectIDs)
                        )
                        .catch((error) => console.log(error));
                })
        }
    }

    decideAPICall(contentIDs, hasCacheOverflowed, indexUserID, requestLength) {
        if (hasCacheOverflowed) {
            return AxiosHelper.returnOverflowContent(
                contentIDs,
                this.props.contentType,
                indexUserID,
                requestLength
            )
        }
        else {
            switch (this.props.contentType) {
                case (PROJECT):
                    return AxiosHelper.returnMultipleProjects(contentIDs);
                case (POST):
                    return AxiosHelper.returnMultiplePosts(contentIDs, true);
                case (PROJECT_EVENT):
                    return AxiosHelper.returnMultiplePosts(contentIDs, true);
                default:
                    throw new Error();
            }
        }
    }

    handleReturnedContent(result, slicedObjectIDs) {
        let data = null;
        const objectIDs = this.props.contentType === DYNAMIC ? null : slicedObjectIDs;
        switch (this.props.contentType) {
            case (PROJECT):
                data = result.projects;
                break;
            case (POST):
                data = result.posts;
                break;
            case (PROJECT_EVENT):
                data = result.posts;
                break;
            case (DYNAMIC):
                data = result;
                break;
            default:
                throw new Error();
        }
        return this.setState({ numOfFeedItems: data.length },
            this.props.createTimelineRow(data, this.props.contentType, objectIDs)
        )
    }


    decideInfiniteScroller() {
        if (this.props.contentType === POST
            ||
            this.props.contentType === PROJECT
            || this.props.contentType === PROJECT_EVENT
        ) {
            return (
                <InfiniteScroll
                    dataLength={this.state.nextOpenPostIndex}
                    next={this.debounceFetch}
                    hasMore={this.props.hasMore}
                    loader={<h4>Loading...</h4>}
                    endMessage={endMessage}>
                    {this.props.loadedFeed.map((row, index) => (
                        <div
                            className='timeline-infinite-scroll-row'
                            key={index}
                        >
                            {row}
                        </div>
                    ))}
                    <br />
                </InfiniteScroll>
            )

        }
        else if (this.props.contentType === DYNAMIC) {
            return (
                <InfiniteScroll
                    dataLength={this.state.nextOpenPostIndex}
                    next={this.debounceFetch}
                    hasMore={this.props.hasMore}
                    loader={<h4>Loading...</h4>}
                    endMessage={endMessage}>
                    {this.props.loadedFeed}
                    <br />
                </InfiniteScroll>
            )
        }
    }

    render() {
        const shouldLoadScroller = this.props.contentType === DYNAMIC
            || (this.props.allPosts && this.props.allPosts.length > 0);
        if (this.props.contentType !== DYNAMIC && !this.props.allPosts
        ) return (
            <div>
                <p>Loading</p>
            </div>
        );
        return (
            <div key={this.props.feedID}>
                {shouldLoadScroller ?
                    this.decideInfiniteScroller()
                    :
                    (<div>
                        <br />
                        <br />
                        <br />
                        {this.props.contentType === PROJECT ?
                            <p> You don't have any projects. Feel free to make one!</p>
                            : <p>There doesn't seem to be anything here.</p>
                        }
                    </div>
                    )
                }
                {this.props.loadedFeed.length > 1 ?
                    null : <div style={{ height: this.props.editProjectState ? '500px' : '200px' }}></div>}

            </div>
        )
    }
}

export default Timeline;