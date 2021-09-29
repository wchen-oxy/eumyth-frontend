import React from 'react';
import Timeline from "./timeline/index";
import ProfileModal from './profile-modal';
import { withRouter } from 'react-router-dom';
import { returnUsernameURL, returnPostURL } from "../constants/urls";
import { POST, POST_VIEWER_MODAL_STATE } from '../constants/flags';


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
    }
    componentDidMount(){
        console.log("mounted post controller");
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

    setModal(postID) {
        this.props.history.replace(returnPostURL(postID));
        this.props.openMasterModal(POST_VIEWER_MODAL_STATE);
    }

    clearModal() {
        this.setState(
            { selectedEvent: null }, () => {
                this.props.history.replace(returnUsernameURL(this.props.targetUser.username));
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
        console.log(this.props.feedData);
        console.log("asdfa");
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
                    onEventClick={this.handleEventClick}
                    shouldPull={this.shouldPull}
                    hasMore={this.state.hasMore}
                    updateFeedData={this.updateFeedData}
                    nextOpenPostIndex={this.state.nextOpenPostIndex}
                />
            </>
        );
    }
}

export default withRouter(PostController);