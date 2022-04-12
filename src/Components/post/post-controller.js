import React from 'react';
import Timeline from '../timeline/index';
import ProfileModal from '../profile/profile-modal';
import EventController from '../timeline/timeline-event-controller';
import { returnUsernameURL, returnPostURL } from 'utils/url';
import { POST, POST_VIEWER_MODAL_STATE } from 'utils/constants/flags';
import withRouter from 'utils/withRouter';
import { REGULAR_CONTENT_REQUEST_LENGTH } from 'utils/constants/settings';

class PostController extends React.Component {
    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            selectedEventIndex: null,
            isModalShowing: false,
            hasMore: true,
            feedData: [],
            selectedPursuitIndex: this.props.selectedPursuitIndex,
            projectPreviewMap: {}

        }
        this.handleEventClick = this.handleEventClick.bind(this);
        this.handleCommentIDInjection = this.handleCommentIDInjection.bind(this);
        this.clearModal = this.clearModal.bind(this);
        this.setModal = this.setModal.bind(this);
        this.shouldPull = this.shouldPull.bind(this);
        this.createTimelineRow = this.createTimelineRow.bind(this);
        this.createRenderedPosts = this.createRenderedPosts.bind(this);
        this.saveProjectPreview = this.saveProjectPreview.bind(this);


    }
    componentDidMount() {
        this._isMounted = true;
    }
    saveProjectPreview(projectPreview) {
        if (!this.state.projectPreviewMap[projectPreview._id]) {
            let projectPreviewMap = this.state.projectPreviewMap;
            projectPreviewMap[projectPreview._id] = projectPreview;
            this.setState({ projectPreviewMap: projectPreviewMap });
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
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
        let masterArray = [];
        let index = masterArray.length - 1; //index position of array in masterArray
        if (!this._isMounted || this.state.feedData.length === 0) {
            return masterArray;
        }
        this.state.feedData.forEach((event, k) => {
            if (k % 4 === 0) {
                masterArray.push([]);
                index++;
            }
            masterArray[index].push(
                <div key={event._id}>
                    <EventController
                        key={index}
                        contentType={POST}
                        eventIndex={k}
                        columnIndex={k % 4}
                        eventData={event}
                        onEventClick={this.handleEventClick}
                    />
                </div>
            );
        })
        return masterArray;
    }

    setModal(postID) {
        this.props.navigate(returnPostURL(postID), { replace: true });
        this.props.openMasterModal(POST_VIEWER_MODAL_STATE);
    }

    clearModal() {
        const username = this.state.feedData[this.state.selectedEventIndex].username;
        this.setState(
            { selectedEventIndex: null }, () => {
                this.props.navigate(returnUsernameURL(username), { replace: true });
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

                    projectPreviewMap={this.state.projectPreviewMap}
                    saveProjectPreview={this.saveProjectPreview}

                />
                <Timeline
                    contentType={POST}
                    requestLength={REGULAR_CONTENT_REQUEST_LENGTH}
                    feedID={this.props.selectedPursuitIndex}
                    allPosts={this.props.feedData}
                    loadedFeed={this.createRenderedPosts()}
                    hasMore={this.state.hasMore}

                    shouldPull={this.shouldPull}
                    createTimelineRow={this.createTimelineRow}
                />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
            </>
        );
    }
}

export default withRouter(PostController);