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

            selectedEvent: null,
            selectedPostIndex: null,
            isModalShowing: false,
        }
        this.modalRef = createRef(null);
        this.handleEventClick = this.handleEventClick.bind(this);
        this.handleCommentIDInjection = this.handleCommentIDInjection.bind(this)
        this.closeModal = this.closeModal.bind(this);
        this.openModal = this.openModal.bind(this);
    }


    openModal(postID) {
        this.modalRef.current.style.display = "block";
        document.body.style.overflow = "hidden";
        this.setState({
            isModalShowing: true
        }, this.props.history.replace(returnPostURL(postID)));

    }

    closeModal() {
        this.modalRef.current.style.display = "none";
        document.body.style.overflow = "visible";
        this.setState(
            {
                isModalShowing: false,
                selectedEvent: null
            }, this.props.history.replace(returnUsernameURL(this.props.targetUsername))
        );
    }

    handleCommentIDInjection(postIndex, rootCommentsArray, feedType) {
        let currentFeed = this.props.loadedFeed;
        const row = Math.floor(this.state.selectedPostIndex / 4);
        const columnIndex = this.state.selectedPostColumnIndex;
        currentFeed[row][columnIndex].props.eventData.comments = rootCommentsArray;
        currentFeed[row][columnIndex].props.eventData.comment_count
            = currentFeed[row][columnIndex].props.eventData.comment_count + 1;
        this.props.updateFeedData(currentFeed);

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
        console.log(this.props.feedIDList);
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
                    feedID={this.props.feedID}
                    allPosts={this.props.feedIDList}
                    targetProfileID={this.props.targetProfileID}
                    loadedFeed={this.props.loadedFeed}
                    onEventClick={this.handleEventClick}
                    shouldPull={this.props.shouldPull}
                    hasMore={this.props.hasMore}
                    updateFeedData={this.props.updateFeedData}
                    nextOpenPostIndex={this.props.nextOpenPostIndex}
                />
            </>
        );
    }
}

export default withRouter(PostController);