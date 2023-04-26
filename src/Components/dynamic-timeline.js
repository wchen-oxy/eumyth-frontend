import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import _ from 'lodash';
import AxiosHelper from 'utils/axios';
import { validateFeedIDs } from 'utils/validator';



const endMessage = "That's It!"
class DynamicTimeline extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fixedDataLoadLength: 8,
            nextOpenIndex: 0,
            feedID: "DynamicTimeline"
        }
        this.debounceFetch = _.debounce(() => this.fetchNextPosts(), 10);
        this.fetchNextPosts = this.fetchNextPosts.bind(this);
        this.callAPI = this.callAPI.bind(this);

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

    callAPI(slicedObjectIDs){
        
    }

    render() {
        return (
            <InfiniteScroll
                dataLength={this.state.nextOpenIndex}
                next={this.debounceFetch}
                hasMore={this.props.hasMore}
                loader={<h4>Loading</h4>}
                endMessage={endMessage}
            >
                <div>

                </div>
            </InfiniteScroll>
        );
    }
}

export default DynamicTimeline;