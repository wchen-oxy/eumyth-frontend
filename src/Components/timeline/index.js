import _ from 'lodash';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import AxiosHelper from 'utils/axios';
import { PROJECT } from 'utils/constants/flags';
import './index.scss';

class Timeline extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props)
        this.state = {
            fixedDataLoadLength: 4,
            nextOpenPostIndex: 0,
            feedID: this.props.feedID,

        }
        this.validateFeedIDs = this.validateFeedIDs.bind(this);
        this.debounceFetch = _.debounce(() => this.fetchNextPosts(), 10)
        this.fetchNextPosts = this.fetchNextPosts.bind(this);
        this.callAPI = this.callAPI.bind(this);
    }

    componentDidUpdate() {
        if (this.props.feedID !== this.state.feedID) {
            this.setState({ feedID: this.props.feedID, nextOpenPostIndex: 0 },
                () => {
                    if (this.state.nextOpenPostIndex < this.props.allPosts.length)
                        this.debounceFetch();
                })
        }
    }

    componentDidMount() {
        this._isMounted = true;

        if (this.props.allPosts.length > 0 && this.props.hasMore) {
            this.debounceFetch();
        }
        else {
            this.props.shouldPull(false);
        }
    }

    validateFeedIDs() {
        if (this.props.allPosts.every(i => (typeof i !== 'string'))) {
            console.log(this.props.allPosts);
            throw new Error('Feed is not just ObjectIDs');
        }
    }

    fetchNextPosts() {
        this.validateFeedIDs();
        this.debounceFetch.cancel();
        const slicedObjectIDs = this.props.allPosts.slice(
            this.state.nextOpenPostIndex,
            this.state.nextOpenPostIndex + this.state.fixedDataLoadLength);
        const feedLimitReached = slicedObjectIDs.length !== this.state.fixedDataLoadLength
        const nextOpenPostIndex = feedLimitReached ?
            this.state.nextOpenPostIndex + slicedObjectIDs.length
            : this.state.nextOpenPostIndex + this.state.fixedDataLoadLength;

        if (nextOpenPostIndex >= this.props.allPosts.length || feedLimitReached) {
            this.props.shouldPull(false);
        }
        this.setState({ nextOpenPostIndex: nextOpenPostIndex },
            () => this.callAPI(slicedObjectIDs))

    }

    callAPI(slicedObjectIDs) {
        const returnContent = (contentType) => (
            contentType === PROJECT ?
                AxiosHelper.returnMultipleProjects(slicedObjectIDs)
                : AxiosHelper.returnMultiplePosts(slicedObjectIDs, true)
        );
        return returnContent(this.props.contentType)
            .then((result) => {
                console.log('Finished');
                if (this._isMounted) {
                    const data = this.props.contentType === PROJECT ? result.data.projects : result.data.posts;
                    this.props.createTimelineRow(
                        data,
                        this.props.contentType,
                        slicedObjectIDs);
                }
            })
            .catch((error) => console.log(error));
    }

    render() {
        const endMessage = (
            <div>
                <br />
                <p style={{ textAlign: 'center' }}>
                    Yay! You have seen it all
                </p>
            </div>
        )
        if (!this._isMounted || !this.props.allPosts) return (
            <div>
                <p>Loading</p>
            </div>
        );
        return (
            <div key={this.props.feedID}>
                {this.props.allPosts && this.props.allPosts.length > 0 ?
                    (<InfiniteScroll
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
                    :
                    <p>There doesn't seem to be anything here</p>
                }
                {this.props.loadedFeed.length > 1 ?
                    null : <div style={{ height: this.props.editProjectState ? '500px' : '200px' }}></div>}
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
            </div>
        )
    }
}

export default Timeline;