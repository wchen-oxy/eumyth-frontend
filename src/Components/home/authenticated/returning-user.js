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
            pursuits: null,
            pursuitNames: null,
            croppedDisplayPhoto: null,
            smallCroppedDisplayPhoto: null,
            indexUserDataID: null,
            fullUserDataID: null,
            preferredPostPrivacy: null,
            followedUserPostIDs: [],
            isMoreFollowedUserPosts: true,
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
            const firebaseName = this.props.firebase.returnName();
            let firstName = firebaseName ? firebaseName.firstName : null;
            let lastName = firebaseName.lastName ? firebaseName.lastName : null;
            let labels = null;
            let followedUserPostIDs = null;
            let preferredPostPrivacy = null;
            let croppedDisplayPhoto = '';
            let smallCroppedDisplayPhoto = '';
            let indexUserDataID = null;
            let fullUserDataID = null;
            let pursuits = null;
            let pursuitNames = [];
            let isMoreFollowedUserPosts = null;
            let totalMin = 0;
            let pursuitInfoArray = [];
            return (AxiosHelper
                .returnIndexUser(this.state.username)
                .then((result) => {
                    const indexUser = result.data;
                    const slicedFeed =
                        indexUser.following_feed.slice(
                            this.state.nextOpenPostIndex,
                            this.state.nextOpenPostIndex +
                            this.state.fixedDataLoadLength
                        );
                    labels = indexUser.labels;
                    followedUserPostIDs = indexUser.following_feed;
                    preferredPostPrivacy = indexUser.preferred_post_privacy
                    croppedDisplayPhoto = indexUser.cropped_display_photo_key;
                    smallCroppedDisplayPhoto = indexUser.small_cropped_display_photo_key;
                    indexUserDataID = indexUser._id;
                    fullUserDataID = indexUser.user_profile_id;
                    pursuits = indexUser.pursuits;
                    isMoreFollowedUserPosts = (
                        !followedUserPostIDs ||
                        followedUserPostIDs.length === 0)
                        ? false : true;

                    if (indexUser.pursuits) {
                        const pursuitObjects =
                            this.createPursuits(indexUser.pursuits);
                        pursuitNames =
                            pursuitObjects.pursuitNames;
                        pursuitInfoArray =
                            pursuitObjects.pursuitInfoArray;
                        totalMin =
                            pursuitObjects.totalMin;
                    }

                    if (isMoreFollowedUserPosts === false) {
                        if (indexUser.recent_posts.length > 0) {
                            return AxiosHelper
                                .returnMultiplePosts(
                                    indexUser.recent_posts,
                                    true)
                                .then((result) => {
                                    return {
                                        isRecentPostsOnly: true,
                                        recentPosts: indexUser.posts
                                    }
                                });
                        }
                        else {
                            return ({
                                isRecentPostsOnly: true,
                                recentPosts: []
                            })
                        }
                    }
                    else {
                        if (indexUser.recent_posts.length > 0) {
                            return Promise.all([
                                AxiosHelper
                                    .returnMultiplePosts(
                                        indexUser.recent_posts,
                                        true),
                                AxiosHelper
                                    .returnMultiplePosts(
                                        slicedFeed,
                                        true)
                            ])
                                .then((results) => {
                                    return {
                                        isRecentPostsOnly: false,
                                        recentPosts: results[0].data.posts,
                                        feedData: results[1].data.posts
                                    }
                                });
                        }
                        else {
                            if (!slicedFeed) {
                                return {
                                    isRecentPostsOnly: true,
                                    feedData: result.data.posts
                                }
                            }
                            else {
                                return AxiosHelper
                                    .returnMultiplePosts(
                                        slicedFeed,
                                        true)
                                    .then((result) => {
                                        if (result.data.posts.length <= this.state.fixedDataLoadLength) {
                                            isMoreFollowedUserPosts = false;
                                        }
                                        return {
                                            isRecentPostsOnly: false,
                                            feedData: result.data.posts
                                        }
                                    });
                            }
                        }
                    }
                })
                .then((result) => {
                    const recentPosts = result && result.recentPosts ?
                        result.recentPosts : [];
                    const feedData = result && !result.isRecentPostsOnly ?
                        result.feedData : [];
                    const nextOpenPostIndex =
                        this.state.nextOpenPostIndex +
                        this.state.fixedDataLoadLength;

                    this.setState(
                        ({
                            firstName: firstName,
                            lastName: lastName,
                            followedUserPostIDs: followedUserPostIDs,
                            preferredPostPrivacy: preferredPostPrivacy,
                            indexUserDataID: indexUserDataID,
                            fullUserDataID: fullUserDataID,
                            croppedDisplayPhoto: croppedDisplayPhoto,
                            smallCroppedDisplayPhoto: smallCroppedDisplayPhoto,
                            pursuits: pursuits,
                            pursuitNames: pursuitNames,
                            pursuitInfoArray: pursuitInfoArray,
                            totalMin: totalMin,
                            recentPosts: recentPosts,
                            feedData: feedData,
                            nextOpenPostIndex: nextOpenPostIndex,
                            isMoreFollowedUserPosts: isMoreFollowedUserPosts,
                            labels: labels
                        }));
                })
                .catch((err) => {
                    console.log(err);
                    alert('Could Not Load Feed.' + err);
                }));
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
                    isRecentEvents={true}
                    index={postIndex}
                    mediaType={POST}
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
        if (!inputArray || inputArray.length === 0) return;
        let masterArray = [];
        let nextOpenPostIndex = this.state.nextOpenPostIndex;
        let index = 0;
        for (const feedItem of inputArray) {
            const preferredPostPrivacy = feedItem.username === this.state.username ? (
                this.state.preferredPostPrivacy) : (null);


            masterArray.push(
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
                    pursuitNames={this.state.pursuitNames}
                    eventData={feedItem}
                    textData={feedItem.text_data}
                    passDataToModal={this.passDataToModal}
                    largeViewMode={false}
                    onCommentIDInjection={this.handleCommentIDInjection}
                />


            );
        }
        return masterArray;

    }

    fetchNextPosts() {
        const newEndIndex = this.state.nextOpenPostIndex +
            this.state.fixedDataLoadLength;
        const slicedPostsArray = this.state.followedUserPostIDs.slice(
            this.state.nextOpenPostIndex,
            newEndIndex)
        let isMoreFollowedUserPosts = true;
        if (newEndIndex >= this.state.followedUserPostIDs.length) {
            isMoreFollowedUserPosts = false;
        }
        return (AxiosHelper
            .returnMultiplePosts(
                slicedPostsArray,
                true)
            .then((result) => {
                if (result.data) {
                    this.setState((state) => ({
                        feedData: state.feedData.concat(result.data.posts),
                        nextOpenPostIndex: newEndIndex,
                        isMoreFollowedUserPosts: isMoreFollowedUserPosts
                    }))
                }
                else {
                    this.setState({ isMoreFollowedUserPosts: false })
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
        let pursuitNames = [];
        let totalMin = 0;
        for (const pursuit of pursuitArray) {
            pursuitNames.push(pursuit.name);
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
            pursuitNames: pursuitNames,
            pursuitInfoArray: pursuitInfoArray,
            totalMin: totalMin
        }
    }

    renderModal() {
        if (this.props.modalState === POST_VIEWER_MODAL_STATE &&
            this.state.selectedEvent) {
            const content = (
                <ShortPostViewer
                    labels={this.state.labels}
                    targetProfileID={this.state.fullUserDataID}
                    targetIndexUserID={this.state.indexUserDataID}
                    largeViewMode={true}
                    visitorUsername={this.state.username}
                    key={this.state.selectedEvent._id}
                    postIndex={this.state.selectedPostIndex}
                    isOwnProfile={true}
                    isPostOnlyView={false}
                    displayPhoto={this.state.smallCroppedDisplayPhoto}
                    preferredPostPrivacy={this.state.preferredPostPrivacy}
                    pursuitNames={this.state.pursuitNames}
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
        const renderedFeed = this.state.feedData.length > 0 ?
            this.createFeed(this.state.feedData) : null;
        const imageURL = this.state.croppedDisplayPhoto ? (
            returnUserImageURL(this.state.croppedDisplayPhoto))
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
                            to={returnUsernameURL(this.state.username)}
                        >
                            <img
                                alt=''
                                id='returninguser-profile-photo'
                                src={imageURL}>
                            </img>
                            <div className='returninguser-profile-text-container'>
                                <p>{this.state.username}</p>
                                <p>{this.state.firstName}</p>
                            </div>
                        </Link>
                    </div>
                    <div className='returninguser-profile-column'>
                        <div className='returninguser-profile-text-container'>
                            Total Hours Spent: {Math.floor(this.state.totalMin / 60)}
                        </div>
                        <div className='returninguser-profile-text-container'>
                            { }
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
                                {this.state.pursuitInfoArray}
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
                            dataLength={this.state.nextOpenPostIndex}
                            next={this.fetchNextPosts}
                            hasMore={this.state.isMoreFollowedUserPosts}
                            loader={<h4>Loading...</h4>}
                            endMessage={
                                <p style={{ textAlign: 'center' }}>
                                    <b>Yay! You have seen it all</b>
                                </p>}>
                            {renderedFeed ? (
                                renderedFeed.map((feedItem) =>
                                    <div className='returninguser-feed-object-container'>
                                        {feedItem}
                                    </div>
                                )) :
                                null}
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
