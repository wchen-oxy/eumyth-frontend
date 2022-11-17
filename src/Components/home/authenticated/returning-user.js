import React from 'react';
import { Link } from 'react-router-dom';
import PostController from "components/post/index";
import AxiosHelper from 'utils/axios';
import { formatPostText, toTitleCase } from 'utils';
import { withAuthorization } from 'store/session';
import { withFirebase } from 'store/firebase';
import withRouter from "utils/withRouter";
import { returnUsernameURL, returnUserImageURL } from 'utils/url';
import { TEMP_PROFILE_PHOTO_URL } from 'utils/constants/urls';
import { RECENT_POSTS, FRIEND_POSTS, POST_VIEWER_MODAL_STATE, FOLLOWED_FEED } from 'utils/constants/flags';
import { REGULAR_CONTENT_REQUEST_LENGTH } from 'utils/constants/settings';
import FriendFeed from './friend-feed';
import ExtraFeed from './extra-feed';

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
            nextOpenPostIndex: 0,
            feedData: [],
            isModalShowing: false,
            selectedEvent: null,
            textData: '',
            recentPosts: null,
            recentPostsKey: 0,

            projectPreviewMap: {},
            isExtraFeedToggled: false
        }

        this.handlePursuitClick = this.handlePursuitClick.bind(this);
        this.handleRecentWorkClick = this.handleRecentWorkClick.bind(this);
        this.handleEventClick = this.handleEventClick.bind(this);
        this.setModal = this.setModal.bind(this);
        this.createPursuits = this.createPursuits.bind(this);
        this.passDataToModal = this.passDataToModal.bind(this);
        this.clearModal = this.clearModal.bind(this);
        this.handleDeletePost = this.handleDeletePost.bind(this);
        this.setFeedData = this.setFeedData.bind(this);
        this.renderModal = this.renderModal.bind(this);
        this.handleCommentIDInjection = this.handleCommentIDInjection.bind(this);
        this.loadData = this.loadData.bind(this);
        this.saveProjectPreview = this.saveProjectPreview.bind(this);
        this.toggleFeedState = this.toggleFeedState.bind(this);
    }

    componentDidMount() {
        this._isMounted = true;
        if (this._isMounted && this.state.username) {
            const pursuitObjects =
                this.createPursuits(this.props.authUser.pursuits);
            this.setState({
                pursuitObjects: pursuitObjects
            }, this.loadData)
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }


    setFeedData(feedData) {
        this.setState({ feedData })
    }
    toggleFeedState(isExtraFeedToggled) {
        this.setState({ isExtraFeedToggled: !isExtraFeedToggled })
    }

    loadData() {
        const error = (result) => { console.log(result + " contains error"); return []; };
        const hasRecentPosts = this.props.authUser.recentPosts.length > 0;
        const hasFollowingPosts = this.props.authUser.followingFeed.length > 0;
        const promisedBasicInfo = [this.props.firebase.returnName()];
        if (hasRecentPosts) {
            const returnedRecent = AxiosHelper.returnMultiplePosts(this.props.authUser.recentPosts, true)
                .then(result => { return result.data.posts }).catch(error);
            promisedBasicInfo.push(returnedRecent);
        }
        else {
            promisedBasicInfo.push(error(RECENT_POSTS));
        }
        if (hasFollowingPosts) {
            const returnedFollow = AxiosHelper.returnMultiplePosts(this.props.authUser.followingFeed, true)
                .then(result => { return result.data.posts }).catch(error);
            promisedBasicInfo.push(returnedFollow);
        }
        else {
            promisedBasicInfo.push(error(FOLLOWED_FEED));
        }

        return Promise.all(promisedBasicInfo)
            .then(results => {
                this.setState(
                    ({
                        recentPosts: results[1],
                        feedData: results[2],
                        firstName: results[0].firstName,
                        lastName: results[0].lastName,
                    }));

            })
            .catch((err) => {
                console.log(err);
                alert('Could Not Load Feed.' + err);
            });
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

    // createFeed(inputArray) {
    //     if (!inputArray || inputArray.length === 0) return [];
    //     let nextOpenPostIndex = this.state.nextOpenPostIndex;

    //     return inputArray.map((feedItem, index) => {
    //         const formattedTextData = formatPostText(feedItem);
    //         const viewerObject = {
    //             key: nextOpenPostIndex++,
    //             largeViewMode: false,
    //             textData: formattedTextData,
    //             isPostOnlyView: false,
    //             pursuitNames: this.state.pursuitObjects.names,
    //             projectPreviewMap: this.state.projectPreviewMap,
    //             eventData: feedItem,

    //             onCommentIDInjection: this.handleCommentIDInjection,
    //             saveProjectPreview: this.saveProjectPreview,
    //             passDataToModal: this.passDataToModal,
    //         }
    //         return (
    //             <PostController
    //                 isViewer
    //                 viewerObject={viewerObject}
    //                 authUser={this.props.authUser}
    //                 closeModal={this.clearModal}
    //             />

    //         );
    //     });
    // }

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
        this.props.navigate(this.state.username, { replace: false });
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
                        {toTitleCase(pursuit.name)}
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

    saveProjectPreview(projectPreview) {
        if (!this.state.projectPreviewMap[projectPreview._id]) {
            let projectPreviewMap = this.state.projectPreviewMap;
            projectPreviewMap[projectPreview._id] = projectPreview;
            this.setState({ projectPreviewMap: projectPreviewMap });
        }
    }

    renderModal() {
        if (this.props.modalState === POST_VIEWER_MODAL_STATE &&
            this.state.selectedEvent) {
            const formattedTextData = formatPostText(this.state.selectedEvent);
            const viewerObject = {
                key: this.state.selectedPostIndex,
                largeViewMode: true,
                textData: formattedTextData,
                isPostOnlyView: false,
                pursuitNames: this.state.pursuitObjects.names,
                projectPreviewMap: this.state.projectPreviewMap,
                eventData: this.state.selectedEvent,
                selectedPostFeedType: this.state.selectedPostFeedType,
                postIndex: this.state.selectedPostIndex,

                onCommentIDInjection: this.handleCommentIDInjection,
                saveProjectPreview: this.saveProjectPreview,
            };
            const content = (
                <PostController
                    isViewer
                    viewerObject={viewerObject}
                    authUser={this.props.authUser}
                    closeModal={this.clearModal}
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
        const imageURL = this.props.authUser.croppedDisplayPhotoKey ? (
            returnUserImageURL(this.props.authUser.croppedDisplayPhotoKey))
            : (
                TEMP_PROFILE_PHOTO_URL);

        // const feed =
        //     this.createFeed(this.state.feedData)
        //         .map((feedItem, index) =>
        //             <div key={index} className='returninguser-feed-object'>
        //                 {feedItem}
        //             </div>
        //         );
        return (
            <div id='returninguser'>
                <div id='returninguser-top-title' >
                    <h4 className='returninguser-title'>Your Dashboard</h4>
                </div>
                <div
                    id='returninguser-profile'
                    className='returninguser-main-row'
                >
                    <div className='returninguser-profile-column btn-round'
                    >
                        <Link
                            to={returnUsernameURL(this.props.authUser.username)}
                        >
                            <img
                                alt=''
                                id='returninguser-dp'
                                src={imageURL}>
                            </img>
                            <div className='returninguser-profile-text'>
                                <p id='returninguser-username-text'>{this.props.authUser.username}</p>
                                <p id='returninguser-name-text'>{this.state.firstName}</p>
                            </div>
                        </Link>
                    </div>
                    <div className='returninguser-profile-column'>
                        <div className='returninguser-profile-text'>
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
                    id='returninguser-feed'
                    className='returninguser-main-row'
                >
                    <h4 className='returninguser-title'>Your Feed</h4>
                    <label className="switch">
                        <input type="checkbox" onChange={() => this.toggleFeedState(this.state.isExtraFeedToggled)} />
                        <span className="slider round"></span>
                    </label>

                    {
                        !this.state.isExtraFeedToggled &&
                        <div id='returninguser-infinite-scroll'>
                            <FriendFeed
                                authUser={this.props.authUser}
                                nextOpenPostIndex={this.state.nextOpenPostIndex}
                                fetchNextPosts={this.fetchNextPosts}
                                pursuitObjects={this.state.pursuitObjects}
                                projectPreviewMap={this.state.projectPreviewMap}

                                setFeedData={this.setFeedData}
                                onCommentIDInjection={this.handleCommentIDInjection}
                                saveProjectPreview={this.saveProjectPreview}
                                passDataToModal={this.passDataToModal}
                                clearModal={this.clearModal}
                                feedData={this.state.feedData}
                            />
                        </div>
                    }
                    {
                        this.state.isExtraFeedToggled &&
                        <ExtraFeed
                            authUser={this.props.authUser}
                            pursuitObjects={this.state.pursuitObjects}
                        />
                    }
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
export default withAuthorization(condition)(withRouter(ReturningUserPage));
