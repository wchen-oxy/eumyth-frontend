import _ from 'lodash';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import AxiosHelper from 'utils/axios';
import { DYNAMIC, POST, PROJECT, PROJECT_EVENT } from 'utils/constants/flags';
import { validateFeedIDs } from 'utils/validator';
import './index.scss';

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
            nextOpenPostIndex: 0,
            feedID: this.props.feedID,

        }
        this.decideInfiniteScroller = this.decideInfiniteScroller.bind(this);
        this.debounceFetch = _.debounce(() => this.fetchNextPosts(), 10)
        this.fetchNextPosts = this.fetchNextPosts.bind(this);
        this.callAPI = this.callAPI.bind(this);
        this.decideAPICall = this.decideAPICall.bind(this);
        this.handleReturnedContent = this.handleReturnedContent.bind(this);
        this.updateMetaInfo = this.updateMetaInfo.bind(this);
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

    updateMetaInfo() {
        const slicedObjectIDs = this.props.allPosts.slice(
            this.state.nextOpenPostIndex,
            this.state.nextOpenPostIndex + this.props.requestLength);
        const feedLimitReached = slicedObjectIDs.length !== this.props.requestLength
        const nextOpenPostIndex = feedLimitReached ?
            this.state.nextOpenPostIndex + slicedObjectIDs.length
            : this.state.nextOpenPostIndex + this.props.requestLength;

        if (nextOpenPostIndex >= this.props.allPosts.length || feedLimitReached) {
            this.props.shouldPull(false);
        }
        return { slicedObjectIDs, nextOpenPostIndex };
    }

    fetchNextPosts() {
        console.log(this.props.contentType);
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
        else if (this.props.contentType === PROJECT || this.props.contentType === POST || this.props.contentType === PROJECT_EVENT) {
            const metaInfo = this.updateMetaInfo();
            this.setState({ nextOpenPostIndex: metaInfo.nextOpenPostIndex },
                () => this.callAPI(metaInfo.slicedObjectIDs))
        }
    }

    callAPI(slicedObjectIDs) {
        return this.decideAPICall(slicedObjectIDs)
            .then((results) => this.handleReturnedContent(results.data, slicedObjectIDs)
            )
            .catch((error) => console.log(error));
    }

    handleReturnedContent(result, slicedObjectIDs) {
        console.log(result);
        switch (this.props.contentType) {
            case (PROJECT):
                return this.props.createTimelineRow(
                    result.projects,
                    this.props.contentType,
                    slicedObjectIDs);
            case (POST):
                return this.props.createTimelineRow(
                    result.posts,
                    this.props.contentType,
                    slicedObjectIDs);
            case (PROJECT_EVENT):
                return this.props.createTimelineRow(
                    result.posts,
                    this.props.contentType,
                    slicedObjectIDs);
            case (DYNAMIC):
                return this.props.createTimelineRow(
                    result,
                    this.props.contentType);
            default:
                throw new Error();
        }
    }

    decideAPICall(slicedObjectIDs) {
        switch (this.props.contentType) {
            case (PROJECT):
                return AxiosHelper.returnMultipleProjects(slicedObjectIDs);
            case (POST):
                return AxiosHelper.returnMultiplePosts(slicedObjectIDs, true);
            case (PROJECT_EVENT):
                return AxiosHelper.returnMultiplePosts(slicedObjectIDs, true);
            default:
                throw new Error();
        }

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