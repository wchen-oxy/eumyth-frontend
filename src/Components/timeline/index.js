import _ from 'lodash';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import AxiosHelper from 'utils/axios';
import { CACHED, DYNAMIC, POST, PROJECT, PROJECT_EVENT, UNCACHED } from 'utils/constants/flags';
import { validateFeedIDs } from 'utils/validator';
const isStatic = (contentType) => {
    return (contentType === POST
        || contentType === PROJECT
        || contentType === PROJECT_EVENT);
}
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
        this.callCachedPosts = this.callCachedPosts.bind(this);
        this.decideAPICall = this.decideAPICall.bind(this);
        this.callUncachedPosts = this.callUncachedPosts.bind(this);
        this.handleCachedResults = this.handleCachedResults.bind(this);
        this.handleUncachedPosts = this.handleUncachedPosts.bind(this);
        this.loadFeedMetaInfo = this.loadFeedMetaInfo.bind(this);
    }

    componentDidUpdate() {
        if (this.props.contentType === DYNAMIC) return;
        if (this.props.feedID !== this.state.feedID) {
            this.setState({ feedID: this.props.feedID, nextOpenPostIndex: 0, numOfFeedItems: 0 },
                () => {
                    if (this.props.contentType === POST) { this.props.setInitialPulled(false) };
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

    loadFeedMetaInfo(allPosts, requestLength, numOfContent) {
        const slicedObjectIDs = allPosts.slice(
            this.state.nextOpenPostIndex,
            this.state.nextOpenPostIndex + requestLength);
        const hasCachedContentOverflowed =
            this.state.numOfFeedItems + requestLength >= allPosts.length;
        const endOfContent = this.state.numOfFeedItems + requestLength >= numOfContent;
        const nextOpenPostIndex = this.state.nextOpenPostIndex + slicedObjectIDs.length;
        if (endOfContent) this.props.shouldPull(false);
        return {
            slicedObjectIDs,
            nextOpenPostIndex,
            hasCachedContentOverflowed,
            endOfContent
        };
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
                    this.setState(
                        { nextOpenPostIndex },
                        this.handleCachedResults(results.data)
                    );
                })
        }
        else if (isStatic(this.props.contentType)) {
            const metaInfo = this.loadFeedMetaInfo(
                this.props.allPosts,
                this.props.requestLength,
                this.props.numOfContent
            );
            const shouldSearchUncached =
                this.props.contentType === POST && metaInfo.hasCachedContentOverflowed;
            // console.log(metaInfo.hasCachedContentOverflowed,
            //     shouldSearchUncached && this.props.initialPulled);
            if (shouldSearchUncached && this.props.initialPulled) {
                return this.callUncachedPosts(
                    this.props.pursuit,
                    this.props.allPosts,
                    this.props.contentType,
                    this.props.profileID,
                    this.props.requestLength
                )
                    .then((results) => this.handleUncachedPosts(results))
                    .catch(error => console.log(error))
            }
            else {
                this.setState({
                    nextOpenPostIndex: metaInfo.nextOpenPostIndex,
                }, //openpostindex notaccurate
                    () => {
                        if (this.props.contentType === POST) this.props.setInitialPulled(true);
                        this.callCachedPosts(metaInfo.slicedObjectIDs);
                    });
            }
        }
    }

    callCachedPosts(objectIDs) {
        return this.decideAPICall(objectIDs)
            .then(results => this.handleCachedResults(results.data, objectIDs))
            .catch(error => console.log(error));
    }

    decideAPICall(contentIDs) {
        if (contentIDs.length === 0) return Promise.resolve({ data: [] });
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

    callUncachedPosts(pursuit, posts, contentType, userID, requestLength) {
        return AxiosHelper.returnOverflowContent(
            pursuit,
            posts,
            contentType,
            userID,
            requestLength
        )
    }


    handleCachedResults(result, slicedObjectIDs) {
        let data = null;
        const objectIDs = this.props.contentType === DYNAMIC ? null : slicedObjectIDs;
        if (result.length === 0) data = result;
        else {
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
        }
        return this.setState({ numOfFeedItems: data.length + this.state.numOfFeedItems },
            this.props.createTimelineRow(data, CACHED, objectIDs)
        )
    }

    handleUncachedPosts(results) {
        const posts = results.data.posts;
        console.log(posts.length);
        return this.setState({
            numOfFeedItems: posts.length + this.state.numOfFeedItems,
            nextOpenPostIndex: posts.length + this.state.nextOpenPostIndex
        },
            this.props.createTimelineRow(posts, UNCACHED)
        );

        //slice selection of post and then put them up
    }

    decideInfiniteScroller() {
        if (this.props.contentType === POST
            ||
            this.props.contentType === PROJECT
            || this.props.contentType === PROJECT_EVENT
        ) {
            const classType = this.props.contentType === PROJECT ?
                'timeline-infinite-scroll-single' :
                'timeline-infinite-scroll-row';
            return (
                <InfiniteScroll
                    dataLength={this.state.numOfFeedItems}
                    next={this.debounceFetch}
                    hasMore={this.props.hasMore}
                    loader={<h4>Loading...</h4>}
                    endMessage={endMessage}>
                    {this.props.loadedFeed.map((row, index) => (
                        <div
                            className={classType}
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
                    dataLength={this.state.numOfFeedItems}
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
        console.log(this.state.numOfFeedItems);
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