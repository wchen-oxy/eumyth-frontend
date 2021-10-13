import React from 'react';
import { withRouter } from 'react-router-dom';
import Timeline from '../timeline/index';
import ProfileModal from '../profile/profile-modal';
import EventController from '../timeline/timeline-event-controller';
import { returnUsernameURL, returnPostURL } from 'utils/url';
import { POST, POST_VIEWER_MODAL_STATE } from 'utils/constants/flags';

class PostController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedEventIndex: null,
            isModalShowing: false,

            hasMore: true,
            feedData: [],
            selectedPursuitIndex: this.props.selectedPursuitIndex
        }
        this.handleEventClick = this.handleEventClick.bind(this);
        this.handleCommentIDInjection = this.handleCommentIDInjection.bind(this)
        this.clearModal = this.clearModal.bind(this);
        this.setModal = this.setModal.bind(this);
        this.shouldPull = this.shouldPull.bind(this);
        this.createTimelineRow = this.createTimelineRow.bind(this);
        this.createRenderedPosts = this.createRenderedPosts.bind(this);
    }

    componentWillUnmount() {
        this.setState({
            hasMore: true,
            feedData: []
        })
    }

    componentDidUpdate() {
        if (this.props.selectedPursuitIndex !== this.state.selectedPursuitIndex) {
            this.setState({
                selectedPursuitIndex: this.props.selectedPursuitIndex,
                feedData: [],
                hasMore: true,
            })
        }
    }

    createTimelineRow(inputArray, contentType, objectIDs) {
        const feedData = this.state.feedData
            .concat(
                inputArray
                    .sort((a, b) =>
                        objectIDs.indexOf(a._id) - objectIDs.indexOf(b._id))
            );
        this.setState({
            feedData
        });
    }

    createRenderedPosts(inputArray, contentType) {
        let masterArray = [[]];
        let index = masterArray.length - 1; //index position of array in masterArray
        let k = masterArray[index].length; //length of last array
        for (let j = 0; j < this.state.feedData.length; j++) {
            while (k < 4) {
                if (!this.state.feedData[j]) break; //if we finish...
                const event = this.state.feedData[j];
                masterArray[index].push(
                    <div key={event._id}>
                        <EventController
                            key={j}
                            contentType={POST}
                            eventIndex={j}
                            columnIndex={k}
                            eventData={event}
                            onEventClick={this.handleEventClick}
                        />
                    </div>
                );
                k++;
                j++;
            }
            if (k === 4) masterArray.push([]);
            index++;
            k = 0;
        }
        return masterArray;
    }

    setModal(postID) {
        this.props.history.replace(returnPostURL(postID));
        this.props.openMasterModal(POST_VIEWER_MODAL_STATE);
    }

    clearModal() {
        const username = this.state.feedData[this.state.selectedEventIndex].username;
        this.setState(
            { selectedEventIndex: null }, () => {
                this.props.history.replace(returnUsernameURL(username));
                this.props.closeMasterModal();
            });
    }

    handleCommentIDInjection(selectedEventIndex, rootCommentsArray) {
        const feedData = this.state.feedData;
        feedData[selectedEventIndex].comments = rootCommentsArray;
        feedData[selectedEventIndex].comment_count += 1;
        this.setState({ feedData });
    }

    handleEventClick(selectedEventIndex) {
        this.setState({
            selectedEventIndex
        }, this.setModal(this.state.feedData[selectedEventIndex]._id))
    }

    shouldPull(value) {
        this.setState({ hasMore: value });
    }


    render() {
        return (
            <>
                <ProfileModal
                    authUser={this.props.authUser}
                    modalState={this.props.modalState}
                    postIndex={this.state.selectedEventIndex}
                    postType={this.state.postType}
                    pursuitNames={this.props.pursuitNames}
                    eventData={this.state.feedData[this.state.selectedEventIndex]}
                    textData={this.state.textData}
                    closeModal={this.clearModal}
                    onCommentIDInjection={this.handleCommentIDInjection}

                    returnModalStructure={this.props.returnModalStructure}
                />
                <Timeline
                    contentType={POST}
                    feedID={this.props.selectedPursuitIndex}
                    allPosts={this.props.feedData}
                    loadedFeed={this.createRenderedPosts()}
                    hasMore={this.state.hasMore}
                    nextOpenPostIndex={this.state.nextOpenPostIndex}

                    shouldPull={this.shouldPull}
                    createTimelineRow={this.createTimelineRow}
                />
            </>
        );
    }
}

export default withRouter(PostController);