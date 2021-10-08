import React from 'react';
import { withRouter } from 'react-router-dom';
import Timeline from './timeline/index';
import ProfileModal from './profile-modal';
import EventController from './timeline/timeline-event-controller';
import { returnUsernameURL, returnPostURL } from 'utils/url';
import { POST, POST_VIEWER_MODAL_STATE } from 'utils/constants/flags';


class PostController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedEvent: null,
            selectedPostColumnIndex: null,
            selectedPostIndex: null,
            isModalShowing: false,

            hasMore: true,
            nextOpenPostIndex: 0,
            loadedFeed: [[]],
            selectedPursuitIndex: this.props.selectedPursuitIndex
        }
        this.handleEventClick = this.handleEventClick.bind(this);
        this.handleCommentIDInjection = this.handleCommentIDInjection.bind(this)
        this.clearModal = this.clearModal.bind(this);
        this.setModal = this.setModal.bind(this);
        this.shouldPull = this.shouldPull.bind(this);
        this.updateFeedData = this.updateFeedData.bind(this);
        this.createTimelineRow = this.createTimelineRow.bind(this);
    }

    componentDidUpdate() {
        if (this.props.selectedPursuitIndex !== this.state.selectedPursuitIndex) {
            this.setState({
                selectedPursuitIndex: this.props.selectedPursuitIndex,
                loadedFeed: [[]],
                hasMore: true,
                nextOpenPostIndex: 0,
            })
        }
    }

    createTimelineRow(inputArray, contentType) {
        let masterArray = this.state.loadedFeed;
        let index = masterArray.length - 1; //index position of array in masterArray
        let nextOpenPostIndex = this.state.nextOpenPostIndex;
        let j = 0;
        let k = masterArray[index].length; //length of last array 
        while (j < inputArray.length) {
            while (k < 4) {
                if (!inputArray[j]) break; //if we finish...
                masterArray[index].push(
                    <div key={k}>
                        <EventController
                            key={nextOpenPostIndex}
                            columnIndex={k}
                            contentType={contentType}
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
        this.updateFeedData(masterArray, nextOpenPostIndex);
    }

    setModal(postID) {
        this.props.history.replace(returnPostURL(postID));
        this.props.openMasterModal(POST_VIEWER_MODAL_STATE);
    }

    clearModal() {
        const username = this.state.selectedEvent.username;
        this.setState(
            { selectedEvent: null }, () => {
                this.props.history.replace(returnUsernameURL(username));
                this.props.closeMasterModal();
            });
    }

    handleCommentIDInjection(postIndex, rootCommentsArray, feedType) {
        let currentFeed = this.state.loadedFeed;
        const row = Math.floor(this.state.selectedPostIndex / 4);
        const columnIndex = this.state.selectedPostColumnIndex;
        const current = currentFeed[row][columnIndex].props.children.props.eventData;
        current.comments = rootCommentsArray;
        current.comment_count = current.comment_count + 1;
        this.updateFeedData(currentFeed);

    }

    handleEventClick(selectedEvent, postIndex, columnIndex) {
        this.setState({
            selectedEvent: selectedEvent,
            selectedPostIndex: postIndex,
            selectedPostColumnIndex: columnIndex,
            textData: selectedEvent.text_data,
            postType: selectedEvent.post_format
        }, this.setModal(selectedEvent._id))
    }

    shouldPull(value) {
        this.setState({ hasMore: value });
    }

    updateFeedData(masterArray, nextOpenPostIndex) {
        this.setState({
            loadedFeed: masterArray,
            nextOpenPostIndex: nextOpenPostIndex
        })
    }

    render() {
        return (
            <>
                <ProfileModal
                    authUser={this.props.authUser}
                    modalState={this.props.modalState}
                    postIndex={this.state.selectedPostIndex}
                    postType={this.state.postType}
                    pursuitNames={this.props.pursuitNames}
                    eventData={this.state.selectedEvent}
                    textData={this.state.textData}
                    closeModal={this.clearModal}
                    onCommentIDInjection={this.handleCommentIDInjection}
                    returnModalStructure={this.props.returnModalStructure}
                />
                <Timeline
                    contentType={POST}
                    feedID={this.props.selectedPursuitIndex}
                    allPosts={this.props.feedData}
                    loadedFeed={this.state.loadedFeed}
                    hasMore={this.state.hasMore}
                    nextOpenPostIndex={this.state.nextOpenPostIndex}
                    onEventClick={this.handleEventClick}
                    shouldPull={this.shouldPull}
                    updateFeedData={this.updateFeedData}
                    createTimelineRow={this.createTimelineRow}
                />
            </>
        );
    }
}

export default withRouter(PostController);