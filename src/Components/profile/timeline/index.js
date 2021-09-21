import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import EventController from './timeline-event-controller';
import AxiosHelper from '../../../Axios/axios';
import { PROJECT, PROJECT_EVENT } from "../../constants/flags";
import './index.scss';

class Timeline extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props)
        this.state = {
            fixedDataLoadLength: 4,
            nextOpenPostIndex: 0
        }
        this.fetchNextPosts = this.fetchNextPosts.bind(this);
        this.createTimelineRow = this.createTimelineRow.bind(this);
    }

    componentDidMount() {
        this._isMounted = true;
        if (this.props.allPosts.length > 0 && this.props.hasMore) {
            this.fetchNextPosts();
        }
        else {
            console.log("SHOULD NOT PULL")
            this.props.shouldPull(false);
        }
    }

    createTimelineRow(inputArray, contentType) {
        let masterArray = this.props.loadedFeed;
        let index = masterArray.length - 1; //index position of array in masterArray
        let nextOpenPostIndex = this.props.nextOpenPostIndex;
        let j = 0;
        let k = masterArray[index].length; //length of last array 
        //while input array is not empty
        while (j < inputArray.length) {
            //while the last sub array is not empty
            while (k < 4) {
                let isSelected = false;
                if (!inputArray[j]) break; //if we finish...
                if (this.props.selectedPosts) {
                    for (const selected of this.props.selectedPosts) {
                        if (selected.key === inputArray[j]._id) isSelected = true;
                    }
                }
                masterArray[index].push(
                    <div key={k}>
                        <EventController
                            columnIndex={k}
                            contentType={contentType}
                            isSelected={isSelected}
                            newProjectView={this.props.newProjectView}
                            key={nextOpenPostIndex}
                            eventIndex={nextOpenPostIndex}
                            eventData={inputArray[j]}
                            onEventClick={this.props.onEventClick}
                            onProjectClick={this.props.onProjectClick}
                            onProjectEventSelect={this.props.onProjectEventSelect}
                        />
                    </div>

                );
                nextOpenPostIndex++;
                k++;
                j++;
            }
            if (k === 4) masterArray.push([]);
            if (!inputArray[j]) break;
            index++;
            k = 0;
        }
        this.props.updateFeedData(masterArray, nextOpenPostIndex);

    }

    fetchNextPosts() {
         if (this.props.nextOpenPostIndex + this.state.fixedDataLoadLength
            >= this.props.allPosts.length) {
            this.props.shouldPull(false);
        }
        if (this.props.contentType === PROJECT) {
            console.log(this.props.allPosts)
            const slicedObjectIDs = this.props.allPosts.slice(
                this.props.nextOpenPostIndex,
                this.props.nextOpenPostIndex + this.state.fixedDataLoadLength).map(
                    (item) => {
                        return item.post_id;
                    });
            return AxiosHelper.returnMultipleProjects(slicedObjectIDs)
                .then((result) => {
                    if (this._isMounted) {
                        this.createTimelineRow(
                            result.data.projects,
                            this.props.contentType);
                    }
                })
                .catch((error) => console.log(error));
        }
        else if (this.props.contentType === PROJECT_EVENT) {
            const slicedObjectIDs = this.props.allPosts.slice(
                this.props.nextOpenPostIndex,
                this.props.nextOpenPostIndex + this.state.fixedDataLoadLength);
            this.props.allPosts.slice(
                this.props.nextOpenPostIndex,
                this.props.nextOpenPostIndex + this.state.fixedDataLoadLength);
            return AxiosHelper.returnMultiplePosts(slicedObjectIDs, false)
                .then((result) => {
                    if (this._isMounted) {
                        console.log(result.data.posts);
                        this.createTimelineRow(
                            result.data.posts,
                            this.props.contentType);
                    }
                })
                .catch((error) => console.log(error));
        }
        else {
            const slicedObjectIDs = this.props.allPosts.slice(
                this.props.nextOpenPostIndex,
                this.props.nextOpenPostIndex + this.state.fixedDataLoadLength).map((item) => item.post_id)
            return AxiosHelper.returnMultiplePosts(slicedObjectIDs, false)
                .then((result) => {
                    if (this._isMounted) {
                        this.createTimelineRow(
                            result.data.posts,
                            this.props.contentType);
                    }
                })
                .catch((error) => console.log(error));
        }
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
                        dataLength={this.props.nextOpenPostIndex}
                        next={this.fetchNextPosts}
                        hasMore={this.props.hasMore}
                        loader={<h4>Loading...</h4>}
                        endMessage={endMessage}>
                        {this.props.loadedFeed.map((row, index) => (
                            <div
                                className="timeline-infinite-scroll-row"
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