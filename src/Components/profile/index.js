import React from 'react';
import { withFirebase } from '../../Firebase';
import PursuitHolder from './sub-components/pursuit-holder';
import AxiosHelper from '../../Axios/axios';
import { AuthUserContext } from '../session';
import NoMatch from '../no-match';
import PostViewerController from "../post/viewer/post-viewer-controller";
import FollowButton from "./sub-components/follow-buttons";
import ProjectController from "../project/index";
import PostController from './post-controller';
import CoverPhoto from './sub-components/cover-photo';
import { returnUserImageURL, TEMP_PROFILE_PHOTO_URL } from "../constants/urls";
import {
    ALL,
    POST,
    PROJECT,
    NEW_PROJECT,
    PRIVATE,
    NOT_A_FOLLOWER_STATE,
    FOLLOW_ACTION,
    UNFOLLOWED_STATE,
    FOLLOW_REQUESTED_STATE,
    FOLLOWED_STATE
} from "../constants/flags";
import './index.scss';

const createPusuitArray = (pursuits) => {
    let pursuitNameArray = [];
    let projectArray = [];
    for (const pursuit of pursuits) {
        pursuitNameArray.push(pursuit.name);
        if (pursuit.projects) {
            for (const project of pursuit.projects) {
                projectArray.push(project);
            }
        }
    }
    return {
        names: pursuitNameArray,
        projects: projectArray
    }
}

const ProfilePage = (props) =>
(
    <AuthUserContext.Consumer>
        {
            authUser => <ProfilePageAuthenticated
                {...props}
                authUser={authUser}
            />

        }
    </AuthUserContext.Consumer>
)


class ProfilePageAuthenticated extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            hasMore: true,
            nextOpenPostIndex: 0,
            loadedFeed: [[]],
            visitorUsername: null,
            isPrivate: true,
            croppedDisplayPhoto: null,
            smallCroppedDisplayPhoto: null,
            coverPhoto: "",
            bio: "",
            pursuits: null,
            recentPosts: null,
            allPosts: null,
            allProjects: null,
            fail: false,
            textData: null,
            userRelationID: null,
            followerStatus: null,
            feedID: null,
            feedIDList: null,
            mediaType: POST,
            selectedPursuit: "ALL",
            selectedPursuitIndex: -1,
            preferredPostPrivacy: null,
            newProjectState: false,
            isPostOnlyView: null,
        }
        this.decideHeroContentVisibility = this.decideHeroContentVisibility.bind(this);
        this.loadInitialProfileData = this.loadInitialProfileData.bind(this);
        this.loadInitialPostData = this.loadInitialPostData.bind(this);
        this.setInitialPostData = this.setInitialPostData.bind(this);
        this.clearLoadedFeed = this.clearLoadedFeed.bind(this);
        this.renderHeroContent = this.renderHeroContent.bind(this);
        this.handleLoadUser = this.handleLoadUser.bind(this);
        this.returnPublicPosts = this.returnPublicPosts.bind(this);
        this.handleFollowClick = this.handleFollowClick.bind(this);
        this.handleFollowerStatusChange = this.handleFollowerStatusChange.bind(this);
        this.handleOptionsClick = this.handleOptionsClick.bind(this);
        this.handleFeedSwitch = this.handleFeedSwitch.bind(this);
        this.handleMediaTypeSwitch = this.handleMediaTypeSwitch.bind(this);
        this.handleNewBackProjectClick = this.handleNewBackProjectClick.bind(this);
        this.updateFeedData = this.updateFeedData.bind(this);
        this.shouldPull = this.shouldPull.bind(this);
    }

    componentDidMount() {
        this._isMounted = true;
        const targetUsername = this.props.match.params.username;
        const visitorUsername = this.props.authUser?.username;
        const requestedPostID = this.props.match.params.postID;
        if (this._isMounted && targetUsername) {
            this.loadInitialProfileData(visitorUsername, targetUsername);
        }
        else if (this._isMounted && requestedPostID) {
            if (visitorUsername) {
                this.loadInitialPostData(visitorUsername)
            }
            else {
                this.loadInitialPostData(null)
            }
        }
        else {
            throw new Error("No profile or post was considered valid input");
        }
    }

    componentDidUpdate() {
        const isNewURL = !this.state.fail &&
            this.props.match.params.username !== this.state.targetUser.username;
        if (isNewURL) {
            this.handleLoadUser(
                this.state.visitorUsername,
                this.props.match.params.username
            );
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    loadInitialProfileData(visitorUsername, targetUsername) {
        if (visitorUsername) {
            this.handleLoadUser(visitorUsername, targetUsername)
        }
        else {
            AxiosHelper
                .returnUser(targetUsername)
                .then(response =>
                    this.handleResponseData(null, response.data, null)
                )
                .catch(error => {
                    console.log(error);
                    this.setState({ fail: true })
                });
        }
    }

    setInitialPostData(post, pursuitNames, username, indexUserID, completeUserID, labels) {
        this.setState({
            selectedEvent: post,
            isPostOnlyView: true,
            postType: post.post_format,
            visitorUsername: username,
            targetUsername: post.username,
            pursuitNames: pursuitNames,
            targetUser: {
                _id: completeUserID,
                index_user_id: indexUserID,
                labels: labels
            }
        })
    }

    loadInitialPostData(username) {
        const indexUser = this.props.authUser?.indexUserInfo;
        if (username) {
            return AxiosHelper
                .retrievePost(this.props.match.params.postID, false)
                .then(result => {
                    const pursuitData = createPusuitArray(indexUser.pursuits);
                    this.setInitialPostData(
                        result[0].data,
                        pursuitData.names,
                        username,
                        indexUser._id,
                        indexUser.user_profile_id,
                        result[0].data.labels
                    )
                })
        }
        else {
            return AxiosHelper
                .retrievePost(this.props.match.params.postID, false)
                .then(
                    (result => {
                        this.setInitialPostData(
                            result.data,
                            [],
                            null
                        )
                    })
                )
        }
    }


    handleLoadUser(loggedInUsername, username) {
        let targetUserInfo = null;
        AxiosHelper
            .returnUser(username)
            .then(response => {
                targetUserInfo = response.data;
                return loggedInUsername !== targetUserInfo.username ?
                    AxiosHelper
                        .returnFollowerStatus(
                            loggedInUsername,
                            targetUserInfo.user_relation_id
                        ) : null;
            })
            .then((response) => {
                this.handleResponseData(
                    loggedInUsername,
                    targetUserInfo,
                    response ? response : null
                );
            })
            .catch(error => {
                console.log(error);
                if (error.response && error.response.status === 404) {
                    this.setState({ fail: true })
                }
            });
    }


    clearLoadedFeed() {
        this.setState({
            loadedFeed: [[]],
            nextOpenPostIndex: 0
        });
    }
    shouldPull(value) {
        this.setState({ hasMore: value });
    }

    handleMediaTypeSwitch(mediaType) {
        if (this.state.newProjectState) {
            if (!window.confirm("Do you want to discard your new project?")) return;
            this.setState({ newProjectState: false });
        }

        if (this.state.selectedPursuitIndex === -1) {
            this.setState((state) => ({
                feedID: ALL + mediaType,
                hasMore: true,
                nextOpenPostIndex: 0,
                loadedFeed: [[]],
                mediaType: mediaType,
                feedIDList: mediaType === POST ? state.allPosts : state.allProjects
            }));
        }
        else {
            this.setState((state) => ({
                nextOpenPostIndex: 0,
                hasMore: true,
                feedID: state.pursuits[state.selectedPursuitIndex].name + mediaType,
                mediaType: mediaType,
                loadedFeed: [[]],
                feedIDList: mediaType === POST ?
                    (state.pursuits[state.selectedPursuitIndex].posts)
                    :
                    (state.pursuits[state.selectedPursuitIndex].projects)
            }));
        }
    }

    handleFeedSwitch(index) {
        if (this.state.newProjectState) {
            if (!window.confirm("Do you want to discard your new project?")) return;
            this.setState({ newProjectState: false });
        }
        else {
            const feedIDList = this.state.mediaType === POST ?
                this.state.pursuits[index].posts
                :
                this.state.pursuits[index].projects;

            this.setState((state) => ({
                hasMore: true,
                nextOpenPostIndex: 0,
                loadedFeed: [[]],
                selectedPursuitIndex: index,
                selectedPursuit: state.pursuits[index].name,
                feedID: state.pursuits[index].name + state.mediaType,
                feedIDList: feedIDList,
            }))
        }
    }

    handleFollowerStatusResponse(followerStatusResponse) {
        if (followerStatusResponse.status === 200) {
            if (followerStatusResponse.data.success) {
                if (followerStatusResponse.data.success === FOLLOWED_STATE) {
                    return FOLLOWED_STATE;
                }

                else if (followerStatusResponse.data.success === FOLLOW_REQUESTED_STATE) {
                    return FOLLOW_REQUESTED_STATE;
                }

                else {
                    throw Error;
                }
            }
            else if (followerStatusResponse.data.error) {
                return (followerStatusResponse.data.error === NOT_A_FOLLOWER_STATE
                    || followerStatusResponse.data.error === UNFOLLOWED_STATE ?
                    NOT_A_FOLLOWER_STATE
                    :
                    FOLLOW_REQUESTED_STATE);
            }
        }
    }

    returnPublicPosts(allPosts) {
        return allPosts.reduce((result, value) => {
            if (value.post_privacy_type !== PRIVATE) { result.push(value); }
            return result;
        }, [])
    }


    handleResponseData(displayName, targetUserInfo, followerStatusResponse) {
        const currentPagePosts = targetUserInfo.pursuits[0].posts ? targetUserInfo.pursuits[0].posts : [];
        const postsArray = displayName === targetUserInfo.username ?
            currentPagePosts : this.returnPublicPosts(currentPagePosts);
        const followerStatus = followerStatusResponse ?
            this.handleFollowerStatusResponse(followerStatusResponse) : null;
        const pursuitData = createPusuitArray(targetUserInfo.pursuits);
        const isOwner = targetUserInfo ? targetUserInfo.username === displayName : false;

        this.setState({
            visitorUsername: displayName ? displayName : null,
            targetUser: targetUserInfo,
            targetIndexUserID: targetUserInfo.index_user_id,
            fail: targetUserInfo ? false : true,
            isOwner: isOwner,
            isPrivate: targetUserInfo.private,
            coverPhoto: targetUserInfo.cover_photo_key,
            croppedDisplayPhoto: targetUserInfo.cropped_display_photo_key,
            smallCroppedDisplayPhoto: targetUserInfo.small_cropped_display_photo_key,
            bio: targetUserInfo.bio,
            pinned: targetUserInfo.pinned,
            pursuits: targetUserInfo.pursuits,
            pursuitNames: pursuitData.names,
            allPosts: postsArray,
            allProjects: pursuitData.projects,
            feedIDList: postsArray,
            mediaType: POST,
            feedID: ALL + POST,
            userRelationID: targetUserInfo.user_relation_id,
            followerStatus: followerStatus,
            isPostOnlyView: false,
        });
    }

    updateFeedData(masterArray, nextOpenPostIndex) {
        this.setState({
            loadedFeed: masterArray,
            nextOpenPostIndex: nextOpenPostIndex
        })
    }

    renderHeroContent() {
        return this.state.mediaType === POST ?
            (
                <PostController
                    feedID={this.state.feedID}
                    targetProfileID={this.state.targetUser._id}
                    targetIndexUserID={this.state.targetUser.index_user_id}
                    feedIDList={this.state.feedIDList}
                    isOwnProfile={this.state.isOwner}
                    visitorUsername={this.state.visitorUsername}
                    targetUsername={this.state.targetUser.username}
                    postIndex={this.state.selectedPostIndex}
                    visitorDisplayPhoto={this.state.smallCroppedDisplayPhoto}
                    preferredPostPrivacy={this.state.preferredPostPrivacy}
                    postType={this.state.postType}
                    pursuitNames={this.state.pursuitNames}
                    eventData={this.state.selectedEvent}
                    textData={this.state.textData}
                    hasMore={this.state.hasMore}
                    nextOpenPostIndex={this.state.nextOpenPostIndex}
                    shouldPull={this.shouldPull}
                    loadedFeed={this.state.loadedFeed}
                    updateFeedData={this.updateFeedData}
                    labels={this.state.targetUser.labels}

                    returnModalStructure={this.props.returnModalStructure}
                    modalState={this.props.modalState}
                    openMasterModal={this.props.openMasterModal}
                    closeMasterModal={this.props.closeMasterModal}
                />
            )
            :
            (<ProjectController
                targetUsername={this.state.targetUser.username}
                displayPhoto={this.state.smallCroppedDisplayPhoto}
                targetProfileID={this.state.targetUser._id}
                targetIndexUserID={this.state.targetUser.index_user_id}
                mediaType={this.state.mediaType}
                newProjectState={this.state.newProjectState}
                feedID={this.state.feedID}
                feedIDList={this.state.feedIDList}
                onNewBackProjectClick={this.handleNewBackProjectClick}
                pursuitNames={this.state.pursuitNames}
                isOwnProfile={this.state.visitorUsername === this.state.targetUser.username}
                clearLoadedFeed={this.clearLoadedFeed}

                hasMore={this.state.hasMore}
                shouldPull={this.shouldPull}
                nextOpenPostIndex={this.state.nextOpenPostIndex}
                loadedFeed={this.state.loadedFeed}
                updateFeedData={this.updateFeedData}

                returnModalStructure={this.props.returnModalStructure}
                modalState={this.props.modalState}
                openMasterModal={this.props.openMasterModal}
                closeMasterModal={this.props.closeMasterModal}
            />)
    }

    handleNewBackProjectClick() {
        if (!this.state.newProjectState) {
            this.setState((state) => ({
                newProjectState: !state.newProjectState,
                feedID: NEW_PROJECT,
                feedIDList: state.allPosts.map(item => item.post_id)
            }));
        }
        else {
            this.setState({ newProjectState: false }, this.handleMediaTypeSwitch(this.state.mediaType))
        }
    }
    handleFollowerStatusChange(action) {
        AxiosHelper.setFollowerStatus(
            this.state.visitorUsername,
            this.state.userRelationID,
            this.state.targetUser.user_preview_id,
            this.state.isPrivate,
            action)
            .then(
                (result) => {
                    if (result.status === 200) {
                        if (result.data.success) {
                            this.setState({ followerStatus: result.data.success });
                        }
                        else {
                            this.setState({ followerStatus: result.data.error });
                        }
                    }
                })
            .catch((error) => {
                console.log(error);
                this.setState({})
            });
    }

    handleFollowClick(action) {
        if (action === FOLLOW_ACTION) this.handleFollowerStatusChange(action);
        else {
            window.confirm("Are you sure you want to unfollow?") &&
                this.handleFollowerStatusChange(action);
        }
    }

    handleOptionsClick() {
    }

    decideHeroContentVisibility() {
        console.log(this.state.visitorUsername === null);
        const hideFromAll = this.state.visitorUsername === null && this.state.isPrivate;
        const hideFromUnauthorized = (!this.state.isOwner && this.state.isPrivate)
            && (this.state.followerStatus !== "FOLLOWING" &&
                this.state.followerStatus !== "REQUEST_ACCEPTED");
        if (this.state.fail) {
            return (
                <p>The user you're looking for does not exist.</p>)
        }
        else if (hideFromAll || hideFromUnauthorized) {
            return (
                <p>This profile is private. To see
                    these posts, please request access. </p>
            );
        }
        else {
            return this.renderHeroContent();
        }
    }

    render() {
        let index = 0;
        const pursuitHolderArray = [];
        if (this.state.pursuits) {
            for (const pursuit of this.state.pursuits) {
                pursuitHolderArray.push(
                    <PursuitHolder
                        isSelected={pursuit.name === this.state.selectedPursuit}
                        name={pursuit.name}
                        numEvents={pursuit.num_posts}
                        key={pursuit.name}
                        value={index++}
                        onFeedSwitch={this.handleFeedSwitch} />
                );
            }
        }
        if (this.state.isPostOnlyView) {
            return (
                <PostViewerController
                    targetProfileID={this.state.targetUser._id}
                    targetIndexUserID={this.state.targetUser.index_user_id}
                    key={this.state.selectedEvent._id}
                    isOwnProfile={this.state.isOwner}
                    visitorUsername={this.state.visitorUsername}
                    largeViewMode={true}
                    isPostOnlyView={this.state.isPostOnlyView}
                    visitorDisplayPhoto={this.state.smallCroppedDisplayPhoto}
                    preferredPostPrivacy={this.state.preferredPostPrivacy}
                    postType={this.state.postType}
                    pursuitNames={this.state.pursuitNames}
                    eventData={this.state.selectedEvent}
                    textData={this.state.selectedEvent.text_data}
                    labels={this.state.targetUser.labels}
                />
            )
        }
        else if (!this.state.isPostOnlyView) {
            const targetUsername = this.state.targetUser ? this.state.targetUser.username : "";
            const targetProfilePhoto =
                this.state.croppedDisplayPhoto ?
                    returnUserImageURL(
                        this.state.croppedDisplayPhoto)
                    :
                    TEMP_PROFILE_PHOTO_URL;

            return (
                <div>
                    <div id="profile-main-container">
                        <div id="profile-cover-photo-container">
                            <CoverPhoto coverPhoto={this.state.coverPhoto} />
                        </div>
                        <div id="profile-intro-container">
                            <div id="profile-display-photo-container">
                                <img
                                    alt="user profile photo"
                                    src={targetProfilePhoto}
                                />

                                <div id="profile-name-container">
                                    <h4>{targetUsername}</h4>
                                </div>
                                <div id="profile-follow-actions-container">
                                    <FollowButton
                                        isOwner={this.state.isOwner}
                                        followerStatus={this.state.followerStatus}
                                        onFollowClick={this.handleFollowClick}
                                        onOptionsClick={this.handleOptionsClick}
                                    />
                                </div>
                            </div>
                            <div id="profile-biography">
                                {this.state.bio ? <p>{this.state.bio}</p> : <p></p>}
                            </div>
                            <div id="profile-pursuits-container">
                                {pursuitHolderArray}
                            </div>
                        </div>

                        <div id="profile-content-switch-container">
                            <button
                                disabled={this.state.mediaType === POST ?
                                    true : false}
                                onClick={() => this.handleMediaTypeSwitch(POST)}>
                                Posts
                            </button>
                            <button
                                disabled={this.state.mediaType === PROJECT ?
                                    true : false}
                                onClick={() => this.handleMediaTypeSwitch(PROJECT)}>
                                Projects
                            </button>
                        </div>
                        {this.decideHeroContentVisibility()}
                    </div>

                </div>
            );
        }
        else {
            return new Error("State condition for postOnlyView was null");
        }

    }
}

export default withFirebase(ProfilePage);