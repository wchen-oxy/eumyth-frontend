import React, { createRef } from 'react';
import { POST } from '../constants/flags';
import Timeline from "./timeline/index";
import AxiosHelper from '../../Axios/axios';
import ProfileModal from './profile-modal';
import { withRouter } from 'react-router-dom';
import { returnUsernameURL, returnPostURL } from "../constants/urls";

class PostController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            feedKey: 0,
            feedData: [[]],
            selectedEvent: null,
            selectedPostIndex: null,
            isModalShowing: false,
        }
        this.modalRef = createRef(null);
        this.updateFeedData = this.updateFeedData.bind(this);
        this.handleEventClick = this.handleEventClick.bind(this);
        this.handleCommentIDInjection = this.handleCommentIDInjection.bind(this)
        this.closeModal = this.closeModal.bind(this);
        this.openModal = this.openModal.bind(this);
    }

    updateFeedData(masterArray) {
        this.setState({ feedData: masterArray })
    }

    openModal(postID) {
        this.modalRef.current.style.display = "block";
        document.body.style.overflow = "hidden";
        this.setState({ isModalShowing: true }, this.props.history.replace(returnPostURL(postID)));

    }

    closeModal() {
        this.modalRef.current.style.display = "none";
        document.body.style.overflow = "visible";
        this.setState(
            {
                isModalShowing: false
            }, this.props.history.replace(returnUsernameURL(this.props.targetUsername))
        );
    }

    handleCommentIDInjection(postIndex, rootCommentsArray, feedType) {
        let currentPost = this.state.feedData;
        const row = Math.floor(this.state.selectedPostIndex / 4);
        const columnIndex = this.state.selectedPostColumnIndex;
        currentPost[row][columnIndex].props.eventData.comments = rootCommentsArray;
        currentPost[row][columnIndex].props.eventData.comment_count
            = currentPost[row][columnIndex].props.eventData.comment_count + 1;
        this.setState((state) => ({
            feedData: currentPost,
            feedKey: state.feedKey + 1
        }))
    }

    handleEventClick(selectedEvent, postIndex, columnIndex) {
        return AxiosHelper
            .retrievePost(selectedEvent._id, true)
            .then(
                (result) =>
                    this.setState({
                        selectedEvent: selectedEvent,
                        selectedPostIndex: postIndex,
                        selectedPostColumnIndex: columnIndex,
                        textData: result.data,
                        postType: selectedEvent.post_format
                    }, this.openModal(selectedEvent._id))
            )
            .catch(error => console.log(error));
    }

    render() {
        return (
            <>
                <ProfileModal
                    modalRef={this.modalRef}
                    isModalShowing={this.state.isModalShowing}
                    targetProfileID={this.props.targetProfileID}
                    targetIndexUserID={this.props.targetIndexUserID}
                    isOwnProfile={this.props.isOwnProfile}
                    visitorUsername={this.props.visitorUsername}
                    postIndex={this.state.selectedPostIndex}
                    visitorDisplayPhoto={this.props.visitorDisplayPhoto}
                    preferredPostPrivacy={this.props.preferredPostPrivacy}
                    postType={this.state.postType}
                    pursuitNames={this.props.pursuitNames}
                    eventData={this.state.selectedEvent}
                    textData={this.state.textData}

                    closeModal={this.closeModal}
                    onCommentIDInjection={this.handleCommentIDInjection}
                />
                <Timeline
                    mediaType={POST}
                    feedKey={this.state.feedKey}
                    allPosts={this.props.feedIDList}
                    targetProfileID={this.props.targetProfileID}
                    feedData={this.state.feedData}
                    onEventClick={this.handleEventClick}
                    updateFeedData={this.updateFeedData}
                />
            </>
        );
    }
}

export default withRouter(PostController);