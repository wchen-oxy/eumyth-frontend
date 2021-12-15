import React from 'react';
import { Link } from 'react-router-dom';
import ShortPostViewer from 'components/post/viewer/short-post';
import InfiniteScroll from 'react-infinite-scroll-component';
import EventController from 'components/timeline/timeline-event-controller';
import AxiosHelper from 'utils/axios';
import { withAuthorization } from 'store/session';
import { withFirebase } from 'store/firebase';
import { returnUsernameURL, returnUserImageURL } from 'utils/url';
import { TEMP_PROFILE_PHOTO_URL } from 'utils/constants/urls';
import { POST, RECENT_POSTS, FRIEND_POSTS, POST_VIEWER_MODAL_STATE } from 'utils/constants/flags';
import './returning-user.scss';

class ReturningUserPage extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            username: this.props.firebase.returnUsername(),
            firstName: null,
            lastName: null,
            pursuitObjects: null,
            croppedDisplayPhoto: null,
            smallCroppedDisplayPhoto: null,
            indexUserDataID: null,
            fullUserDataID: null,
            preferredPostPrivacy: null,
            followedUserPostIDs: [],
            hasMore: true,
            fixedDataLoadLength: 4,
            nextOpenPostIndex: 0,
            feedData: [],
            isModalShowing: false,
            selectedEvent: null,
            textData: '',
            recentPosts: null,
            recentPostsKey: 0
        }

        this.handlePursuitClick = this.handlePursuitClick.bind(this);
        this.handleRecentWorkClick = this.handleRecentWorkClick.bind(this);
        this.handleEventClick = this.handleEventClick.bind(this);
        this.setModal = this.setModal.bind(this);
        this.createPursuits = this.createPursuits.bind(this);
        this.passDataToModal = this.passDataToModal.bind(this);
        this.clearModal = this.clearModal.bind(this);
        this.handleDeletePost = this.handleDeletePost.bind(this);
        this.fetchNextPosts = this.fetchNextPosts.bind(this);
        this.createFeed = this.createFeed.bind(this);
        this.renderModal = this.renderModal.bind(this);
        this.renderRecentPosts = this.renderRecentPosts.bind(this);
        this.handleCommentIDInjection = this.handleCommentIDInjection.bind(this);
    }

    componentDidMount() {
        this._isMounted = true;
        if (this._isMounted && this.state.username) {
            const pursuitObjects =
                this.createPursuits(this.props.authUser.pursuits);
            return Promise.all([
                AxiosHelper.returnMultiplePosts(this.props.authUser.recentPosts, true),
                this.props.firebase.returnName()
            ]).then((results) => {
                const recentPosts = results[0].data?.posts ?? [];
                console.log(results[1]);
                this.setState(
                    ({
                        firstName: results[1].firstName,
                        lastName: results[1].lastName,
                        recentPosts: recentPosts,
                        hasMore: this.props.authUser.followingFeed.length > 0,
                        pursuitObjects: pursuitObjects,
                    }));
            })
                .catch((err) => {
                    console.log(err);
                    alert('Could Not Load Feed.' + err);
                });
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    renderRecentPosts(data) {
        let postIndex = 0;
        let array = []
        for (const value of data) {
            array.push(
                <EventController
                    columnIndex={2}
                    isRecentEvents={true}
                    index={postIndex}
                    contentType={POST}
                    key={postIndex}
                    eventData={value}
                    onEventClick={this.handleEventClick}
                />);
            postIndex++;
        }
        return array;
    }

    handleCommentIDInjection(postIndex, rootCommentsArray, feedType) {
        if (feedType === RECENT_POSTS) {
            let recentPosts = this.state.recentPosts;
            recentPosts[postIndex].comments = rootCommentsArray;
            recentPosts[postIndex].comment_count = recentPosts[postIndex].comment_count + 1;
            this.setState(
                (state) =>
                ({
                    recentPosts: recentPosts,
                    recentPostsKey: state.recentPostsKey + 1
                }));
        }
        else if (feedType === FRIEND_POSTS) {
            let friendPosts = this.state.feedData;
            friendPosts[postIndex].comments = rootCommentsArray;
            this.setState({ feedData: friendPosts })
        }
    }

    createFeed(inputArray) {
        if (!inputArray || inputArray.length === 0) return [];
        let nextOpenPostIndex = this.state.nextOpenPostIndex;

        return inputArray.map((feedItem, index) => {
            const preferredPostPrivacy = feedItem.username === this.state.username ? (
                this.state.preferredPostPrivacy) : (null);

            return (
                <ShortPostViewer
                    labels={this.state.labels}
                    targetProfileID={this.state.fullUserDataID}
                    targetIndexUserID={this.state.indexUserDataID}
                    key={nextOpenPostIndex++}
                    postIndex={index++}
                    postID={feedItem._id}
                    visitorUsername={this.state.username}
                    isOwnProfile={feedItem.username === this.state.username}
                    displayPhoto={feedItem.display_photo_key}
                    preferredPostPrivacy={preferredPostPrivacy}
                    pursuitNames={this.state.pursuitObjects.names}
                    eventData={feedItem}
                    textData={feedItem.text_data}
                    passDataToModal={this.passDataToModal}
                    largeViewMode={false}
                    onCommentIDInjection={this.handleCommentIDInjection}
                />)
        });
    }

    fetchNextPosts() {
        const posts = this.props.authUser.followingFeed
        const slicedObjectIDs = posts.slice(
            this.state.nextOpenPostIndex,
            this.state.nextOpenPostIndex + this.state.fixedDataLoadLength);
        const feedLimitReached = slicedObjectIDs.length !== this.state.fixedDataLoadLength
        const nextOpenPostIndex = feedLimitReached ?
            this.state.nextOpenPostIndex + slicedObjectIDs.length
            : this.state.nextOpenPostIndex + this.state.fixedDataLoadLength;
        const hasMore = nextOpenPostIndex >= posts.length || feedLimitReached;
        return (AxiosHelper
            .returnMultiplePosts(
                slicedObjectIDs,
                true)
            .then((result) => {
                if (result.data) {
                    this.setState((state) => ({
                        feedData: state.feedData.concat(result.data.posts),
                        nextOpenPostIndex: nextOpenPostIndex,
                        hasMore: !hasMore
                    }))
                }

            })
            .catch((error) => {
                console.log(error);
                alert(error);
            }));
    }

    handleDeletePost() {
        return AxiosHelper.deletePost(
            this.state.fullUserDataID,
            this.state.indexUserDataID,
            this.state.selectedEvent._id
        ).then(
            (result) => {
                alert(result);
            }
        );
    }

    passDataToModal(data, type, postIndex) {
        this.setState({
            selectedEvent: data,
            textData: data.text_data,
            selectedPostFeedType: FRIEND_POSTS,
            selectedPostIndex: postIndex,
        }, this.setModal())
    }

    setModal() {
        this.props.openMasterModal(POST_VIEWER_MODAL_STATE);
    }

    clearModal() {
        this.setState({
            selectedEvent: null
        },
            this.props.closeMasterModal());
    }

    handlePursuitClick(e) {
        e.preventDefault();
        this.props.history.push(this.state.username);
    }

    handleRecentWorkClick(e, value) {
        e.preventDefault();
        alert(value);
    }

    handleEventClick(selectedEvent, postIndex) {
        if (this._isMounted) {
            this.setState({
                selectedEvent: selectedEvent,
                selectedPostIndex: postIndex,
                selectedPostFeedType: RECENT_POSTS,
            }, this.setModal());
        }
    }

    createPursuits(pursuitArray) {
        let pursuitInfoArray = [];
        let names = [];
        let totalMin = 0;
        for (const pursuit of pursuitArray) {
            names.push(pursuit.name);
            totalMin += pursuit.total_min;
            pursuitInfoArray.push(
                <tr key={pursuit.name}>
                    <th key={pursuit.name + ' name'}>
                        {pursuit.name}
                    </th>
                    <td key={pursuit.name + ' experience'}>
                        {pursuit.experience_level}
                    </td>
                    <td key={pursuit.total_min + 'minutes'}>
                        {pursuit.total_min}
                    </td>
                    <td key={pursuit.num_posts + 'posts'}>
                        {pursuit.posts ? pursuit.posts.length : 0}
                    </td>
                    <td key={pursuit.num_milestones + ' milestones'}>
                        {pursuit.num_milestones}
                    </td>
                </tr>
            );
        }
        return {
            names: names,
            pursuitInfoArray: pursuitInfoArray,
            totalMin: totalMin
        }
    }

    renderModal() {
        if (this.props.modalState === POST_VIEWER_MODAL_STATE &&
            this.state.selectedEvent) {
            const content = (
                <ShortPostViewer
                    authUser={this.props.authUser}
                    largeViewMode={true}
                    postIndex={this.state.selectedPostIndex}
                    isOwnProfile={true}
                    isPostOnlyView={false}
                    preferredPostPrivacy={this.state.preferredPostPrivacy}
                    pursuitNames={this.state.pursuitObjects.names}
                    eventData={this.state.selectedEvent}
                    selectedPostFeedType={this.state.selectedPostFeedType}
                    textData={this.state.selectedEvent.text_data}
                    closeModal={this.clearModal}
                    onCommentIDInjection={this.handleCommentIDInjection}
                />
            );
            return this.props.returnModalStructure(
                content,
                this.clearModal
            );
        }
        else {
            return null;
        }
    }

    render() {

        const imageURL = this.props.authUser.croppedDisplayPhoto ? (
            returnUserImageURL(this.props.authUser.croppedDisplayPhoto))
            : (
                TEMP_PROFILE_PHOTO_URL);
        const renderedRecentPosts = this.state.recentPosts ?
            this.renderRecentPosts(this.state.recentPosts) : null;

        return (
            <div id='returninguser-body-container'>
                <div id='returninguser-top-title-container' >
                    <h4 className='returninguser-title'>Your Dashboard</h4>
                </div>
                <div
                    id='returninguser-profile-container'
                    className='returninguser-main-row'
                >
                    <div
                        id='returninguser-hero-profile-column'
                        className='returninguser-profile-column'
                    >
                        <Link
                            to={returnUsernameURL(this.props.authUser.username)}
                        >
                            <img
                                alt=''
                                id='returninguser-profile-photo'
                                src={imageURL}>
                            </img>
                            <div className='returninguser-profile-text-container'>
                                <p>{this.props.authUser.username}</p>
                                <p>{this.state.firstName}</p>
                            </div>
                        </Link>
                    </div>
                    <div className='returninguser-profile-column'>
                        <div className='returninguser-profile-text-container'>
                            Total Hours Spent:
                            {Math.floor(this.state.pursuitObjects?.totalMin ?? 0 / 60)}
                        </div>
                    </div>
                    <div className='returninguser-profile-column'>
                        <table id='returninguser-pursuit-info-table'>
                            <tbody>
                                <tr>
                                    <th></th>
                                    <th>Level</th>
                                    <th>Minutes Spent</th>
                                    <th>Posts</th>
                                    <th>Milestones</th>
                                </tr>
                                {this.state.pursuitObjects?.pursuitInfoArray ?? null}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div
                    id='returninguser-recent-work-container'
                    className='returninguser-main-row'
                >
                    <div className='returninguser-row'>
                        <Link
                            id='returninguser-recent-work-title'
                            className='returninguser-title'
                            to={returnUsernameURL(this.state.username)}
                        >
                            Your Recent Work
                        </Link>
                    </div>
                    <div
                        key={this.state.recentPostsKey}
                        id='returninguser-recent-posts-container'
                        className='returninguser-row'>
                        {renderedRecentPosts}
                    </div>
                </div>
                <div
                    id='returninguser-feed-container'
                    className='returninguser-main-row'
                >
                    <h4 className='returninguser-title'>Your Feed</h4>
                    <div id='returninguser-infinite-scroll-container' >
                        <InfiniteScroll
                            dataLength={this.state.fixedDataLoadLength}
                            next={this.fetchNextPosts}
                            hasMore={this.state.hasMore}
                            loader={<h4>Loading...</h4>}
                            endMessage={
                                <p style={{ textAlign: 'center' }}>
                                    <b>Yay! You have seen it all</b>
                                </p>}>
                            {this.createFeed(this.state.feedData)
                                .map((feedItem) =>
                                    <div className='returninguser-feed-object-container'>
                                        {feedItem}
                                    </div>
                                )}
                        </InfiniteScroll>
                    </div>
                </div>
                {this.renderModal()}
            </div>
        )
    }
}

const handleCheckUser = () => {
    this.props.firebase.checkIsExistingUser()
}

const condition = authUser => !!authUser && withFirebase(handleCheckUser);
export default withAuthorization(condition)(withFirebase(ReturningUserPage));
