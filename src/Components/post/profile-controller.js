import React from 'react';
import Timeline from '../timeline/index';
import ProfileModal from '../profile/profile-modal';
import EventController from '../timeline/timeline-event-controller';
import { returnUsernameURL, returnPostURL } from 'utils/url';
import { POST, POST_VIEWER_MODAL_STATE } from 'utils/constants/flags';
import withRouter from 'utils/withRouter';
import { REGULAR_CONTENT_REQUEST_LENGTH } from 'utils/constants/settings';
import { formatPostText } from 'utils';

class ProfileController extends React.Component {
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
        const navPress = (type) => {
            if (this.props.modalState === POST_VIEWER_MODAL_STATE) {
                this.clearModal(true);
            }
            else if (!this.props.modalState) {
                if (window.location.pathname[1] === 'p') {
                    if (!this.state.selectedEventIndex) {
                        window.location.reload();
                    }
                    else {
                        this.setModal(this.state.feedData[this.state.selectedEventIndex]._id, true);
                    }
                }
            }

        }
        window.addEventListener('popstate', navPress);


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
        }, () => window.removeEventListener('popstate'))
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

    handleEventClick(selectedEventIndex) {
        this.setState({
            selectedEventIndex
        }, this.setModal(this.state.feedData[selectedEventIndex]._id))
    }

    setModal(postID, isForwardPress) {
        if (!isForwardPress) this.props.navigate(returnPostURL(postID), { replace: false });
        this.props.openMasterModal(POST_VIEWER_MODAL_STATE);
    }

    clearModal(isBackPress) {
        // if (isBackPress) this.props.navigate("u/" + this.props.authUser.username, { replace: false });
        if (!isBackPress) this.props.navigate(-1);
        this.props.closeMasterModal();
    }

    handleCommentIDInjection(selectedEventIndex, rootCommentsArray) {
        const feedData = this.state.feedData;
        feedData[selectedEventIndex].comments = rootCommentsArray;
        feedData[selectedEventIndex].comment_count += 1;
        this.setState({ feedData });
    }


    shouldPull(value) {
        this.setState({ hasMore: value });
    }


    render() {
        const event = this.state.feedData[this.state.selectedEventIndex];
        const viewerObject = {
            largeViewMode: true,
            textData: event ? formatPostText(event) : null,
            isPostOnlyView: false,
            pursuitNames: this.props.pursuitNames,
            eventData: event,
            projectPreviewMap: this.state.projectPreviewMap,

            postIndex: this.state.selectedEventIndex,
            onCommentIDInjection: this.handleCommentIDInjection,
            saveProjectPreview: this.saveProjectPreview
        }
        return (
            <>
                <ProfileModal
                    viewerObject={viewerObject}
                    authUser={this.props.authUser}
                    modalState={this.props.modalState}
                    saveProjectPreview={this.saveProjectPreview}
                    closeModal={this.clearModal}
                    returnModalStructure={this.props.returnModalStructure}

                />
                <Timeline
                    contentType={POST}
                    requestLength={REGULAR_CONTENT_REQUEST_LENGTH}
                    feedID={this.props.selectedPursuitIndex}
                    allPosts={this.props.feedData}
                    hasMore={this.state.hasMore}

                    loadedFeed={this.createRenderedPosts()}
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

export default withRouter(ProfileController);