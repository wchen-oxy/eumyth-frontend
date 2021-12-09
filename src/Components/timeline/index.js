import _ from 'lodash';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import AxiosHelper from 'utils/axios';
import { PROJECT } from 'utils/constants/flags';
import { validateFeedIDs } from 'utils/validator';
import './index.scss';

class Timeline extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props)
        this.state = {
            fixedDataLoadLength: 8,
            nextOpenPostIndex: 0,
            feedID: this.props.feedID,

        }
        this.debounceFetch = _.debounce(() => this.fetchNextPosts(), 10)
        this.fetchNextPosts = this.fetchNextPosts.bind(this);
        this.callAPI = this.callAPI.bind(this);
    }

    componentDidUpdate() {
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
        validateFeedIDs(this.props.allPosts);
        if (this.props.allPosts.length > 0 && this.props.hasMore) {
            this.debounceFetch();
        }
        else {
            this.props.shouldPull(false);
        }
    }


    fetchNextPosts() {
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