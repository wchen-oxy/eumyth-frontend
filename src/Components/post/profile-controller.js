import React from 'react';
import Timeline from '../timeline/index';
import ProfileModalController from '../profile/profile-modal';
import EventController from '../timeline/timeline-event-controller';
import { returnPostURL } from 'utils/url';
import { POST, POST_VIEWER_MODAL_STATE, UNCACHED } from 'utils/constants/flags';
import withRouter from 'utils/withRouter';
import { REGULAR_CONTENT_REQUEST_LENGTH } from 'utils/constants/settings';
import { alterRawCommentArray, formatPostText, sortTimelineContent } from 'utils';

const _createObjectIDs = (inputArray) => {
    return inputArray.map(
        item => {
            return {
                content_id: item._id,
                labels: item.labels,
                date: item.date,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            }
        });
}

class ProfileController extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            selectedEventIndex: null,
            isModalShowing: false,
            hasMore: true,
            feedData: [],
            feedID: this.props.feedID,
            projectPreviewMap: {},
            initialPulled: false,

        }
        this.handleEventClick = this.handleEventClick.bind(this);
        this.handleCommentIDInjection = this.handleCommentIDInjection.bind(this);
        this.clearModal = this.clearModal.bind(this);
        this.setModal = this.setModal.bind(this);
        this.shouldPull = this.shouldPull.bind(this);
        this.createTimelineRow = this.createTimelineRow.bind(this);
        this.createRenderedPosts = this.createRenderedPosts.bind(this);
        this.saveProjectPreview = this.saveProjectPreview.bind(this);
        this.setInitialPulled = this.setInitialPulled.bind(this);


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

    setInitialPulled(initialPulled) {
        this.setState({ initialPulled })
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
        if (this.props.feedID !== this.state.feedID) {
            console.log("diffe");

            this.setState({
                feedID: this.props.feedID,
                feedData: [],
                hasMore: true,
                initialPulled: false,
            })
        }
    }

    createTimelineRow(inputArray, contentType, objectIDs) {
        const feedData =
            sortTimelineContent(
                this.state.feedData,
                inputArray,
                contentType,
                objectIDs
            )

        this.setState({ feedData }, () => {
            if (contentType === UNCACHED) {
                const objectIDs = _createObjectIDs(inputArray);
                this.props.updateAllPosts(objectIDs);
            }
        });
    }

    createRenderedPosts(inputArray, contentType) {
        let masterArray = [];
        let index = masterArray.length - 1; //index position of array in masterArray
        const modulo = 3;
        if (!this._isMounted || this.state.feedData.length === 0) {
            return masterArray;
        }
        this.state.feedData.forEach((event, k) => {
            if (k % modulo === 0) {
                masterArray.push([]);
                index++;
            }
            masterArray[index].push(
                <div key={event._id}>
                    <EventController
                        key={index}
                        modulo={modulo}
                        contentType={POST}
                        eventIndex={k}
                        columnIndex={k % modulo}
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

    handleCommentIDInjection(postIndex, rootCommentsArray) {
        const feedData = alterRawCommentArray(
            postIndex,
            rootCommentsArray,
            this.state.feedData
        );
        this.setState({
            feedData: feedData
        });
    }

    shouldPull(value) {
        this.setState({ hasMore: value });
    }

    render() {
        console.log(this.state.initialPulled,this.state.hasMore);
        const event = this.state.feedData[this.state.selectedEventIndex];
        const viewerObject = {
            largeViewMode: true,
            textData: event ? formatPostText(event) : null,
            isPostOnlyView: false,
            pursuitNames: this.props.pursuitNames,
            eventData: event,
            projectPreviewMap: this.state.projectPreviewMap,
            selectedIndex: this.state.selectedEventIndex //needed for adding comment Data to original post

        }
        const viewerFunctions = {
            onCommentIDInjection: this.handleCommentIDInjection,
            saveProjectPreview: this.saveProjectPreview,
            setModal: this.setModal,
            closeModal: this.clearModal
        }

        return (
            <>
                <ProfileModalController
                    viewerObject={viewerObject}
                    viewerFunctions={viewerFunctions}

                    authUser={this.props.authUser}
                    modalState={this.props.modalState}
                    returnModalStructure={this.props.returnModalStructure}
                />
                <Timeline //feeds allposts (post ids) in, returns raw data, then feeds formatted posts in
                    contentType={POST}
                    pursuit={this.props.pursuit}
                    profileID={this.props.authUser.profileID}
                    requestLength={REGULAR_CONTENT_REQUEST_LENGTH}
                    initialPulled={this.state.initialPulled}
                    feedID={this.props.feedID}
                    allPosts={this.props.feedData} //list of posts
                    numOfContent={this.props.numOfContent}
                    hasMore={this.state.hasMore}

                    loadedFeed={this.createRenderedPosts()} //formatted posts
                    shouldPull={this.shouldPull}
                    createTimelineRow={this.createTimelineRow}
                    setInitialPulled={this.setInitialPulled}
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