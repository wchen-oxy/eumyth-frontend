import React from 'react';
import { withFirebase } from '../../Firebase';
import { withRouter } from 'react-router-dom';
import PursuitHolder from './sub-components/pursuit-holder';
import AxiosHelper from '../../Axios/axios';
import { AuthUserContext } from '../session';
import FollowButton from "./sub-components/follow-buttons";
import ProjectController from "../project/index";
import PostController from './post-controller';
import CoverPhoto from './sub-components/cover-photo';
import { returnUserImageURL, returnUsernameURL } from "../constants/urls";
import {
    POST,
    PROJECT,
    PRIVATE,
    NOT_A_FOLLOWER_STATE,
    FOLLOW_ACTION,
    UNFOLLOWED_STATE,
    FOLLOW_REQUESTED_STATE,
    FOLLOWED_STATE
} from "../constants/flags";
import './index.scss';
import ShortPostViewer from '../post/viewer/short-post';

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

const filterPublicPosts = (allPosts) => {
    return allPosts.reduce((result, value) => {
        if (value.post_privacy_type !== PRIVATE) { result.push(value); }
        return result;
    }, [])
}

const ProfilePage = (props) =>
(
    <AuthUserContext.Consumer>
        {
            authUser =>
                <ProfilePageAuthenticated
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
            visitorUsername: this.props.authUser?.username ?? null,
            visitorProfileID: this.props.authUser?.profileID ?? null,
            isPrivate: true,
            croppedDisplayPhoto: null,
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
            feedIDList: null,
            contentType: null,
            selectedPursuit: "ALL",
            selectedPursuitIndex: 0,
            preferredPostPrivacy: null,
            isContentOnlyView: null,
        }

        this.decideHeroContentVisibility = this.decideHeroContentVisibility.bind(this);
        this.loadMacroProjectData = this.loadMacroProjectData.bind(this);
        this.loadMicroProjectData = this.loadMicroProjectData.bind(this);
        this.loadMicroPostData = this.loadMicroPostData.bind(this);
        this.setContentOnlyData = this.setContentOnlyData.bind(this);
        this.renderHeroContent = this.renderHeroContent.bind(this);
        this.handleFollowClick = this.handleFollowClick.bind(this);
        this.handleFollowerStatusChange = this.handleFollowerStatusChange.bind(this);
        this.handleFeedSwitch = this.handleFeedSwitch.bind(this);
        this.handleMediaTypeSwitch = this.handleMediaTypeSwitch.bind(this);
        this.loadProfile = this.loadProfile.bind(this);
        this.setProfileData = this.setProfileData.bind(this);
        this.loadFollowerStatus = this.loadFollowerStatus.bind(this);
        this.loadedContentCallback = this.loadedContentCallback.bind(this);
    }

    componentDidMount() {
        this._isMounted = true;
        const targetUsername = this.props.match.params.username;
        const params = this.props.match.params;
        const requestedPostID = params.postID;
        const requestedProjectID = params.projectID;
        const isPostMicroView = requestedPostID ? POST : null;
        const isProjectMacroView = this.props.isProjectView;
        const isProjectMicroView = requestedProjectID ? PROJECT : null;

        if (this._isMounted && isProjectMacroView) {
            return this.loadProfile(targetUsername, PROJECT);
        }
        else if (this._isMounted && targetUsername) {
            return this.loadProfile(targetUsername, POST);
        }
        else if (this._isMounted && isPostMicroView) {
            return this.loadMicroPostData(requestedPostID)
        }
        else if (this._isMounted && isProjectMicroView) {
            return this.loadMicroProjectData(requestedProjectID);
        }
    }

    componentDidUpdate() {
        const username = this.props.match.params.username;
        const isSamePage = username !== this.state.targetUser?.username;
        const isViewingPost = this.props.match.params.postID ? true : false;
        const isViewingProject = this.props.match.params.projectID ? true : false;

        const isNewURL = !this.state.fail && isSamePage && !isViewingPost && !isViewingProject;
        if (isNewURL) {
            return this.loadProfile(username);
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    loadMacroProjectData(username) {
        const isOwner = this.state.visitorUsername === username;
        let userData = null;
        return AxiosHelper
            .returnUser(username)
            .then((result) => {
                userData = result.data;
                return this.loadFollowerStatus(
                    userData.user_relation_id,
                    userData.private,
                    isOwner)
            })
    }
    //full Profile
    loadProfile(username, contentType) {
        const isOwner = this.state.visitorUsername === username;
        let userData = null;
        return AxiosHelper
            .returnUser(username)
            .then((result) => {
                userData = result.data;
                return this.loadFollowerStatus(
                    userData.user_relation_id,
                    userData.private,
                    isOwner)
            })
            .then((result) =>
                this.setProfileData(
                    userData,
                    result?.data ?? null,
                    isOwner,
                    contentType
                ))
            .catch((err) => {
                console.log(err);
                this.setState({ fail: true });
            });
    }

    loadFollowerStatus(userRelationID, isPrivate, isOwner) {
        if (isOwner) {
            return null;
        }
        else if (!isPrivate) {
            return null;
        }
        else if (isPrivate) {
            return AxiosHelper
                .returnFollowerStatus(
                    this.state.visitorUsername,
                    userRelationID);
        }
    }


    loadedContentCallback(contentType, data) {
        if (this.state.visitorUsername) {
            const authUser = this.props.authUser;
            const pursuitData = createPusuitArray(authUser.pursuits);
            this.setContentOnlyData(
                contentType,
                data.project,
                pursuitData.names,
                authUser.username,
                authUser.indexProfileID,
                authUser.profileID,
                data.labels
            )
        }
        else {
            this.setContentOnlyData(
                contentType,
                data.project,
                null,
                null,
                null,
                null,
                data.labels
            )
        }
    }

    setProfileData(userData, rawFollowerState, isOwner, contentType) {
        const pursuitData = createPusuitArray(userData.pursuits);
        const followerStatus = this.handleFollowerStatusResponse(rawFollowerState);
        this.setState({
            coverPhotoKey: userData.cover_photo_key,
            croppedDisplayPhotoKey: userData.croppedDisplayPhotoKey,
            smallCroppedDisplayPhotoKey: userData.smallCroppedDisplayPhotoKey,
            bio: userData.bio,
            pinnedPost: userData.pinned,
            pursuits: userData.pursuits,
            pursuitNames: pursuitData.names,
            userRelationID: userData.user_relation_id,
            followerStatus: followerStatus,
            contentType: contentType,
            isContentOnlyView: false,
            isOwner: isOwner,
            targetUser: {
                username: userData.username,
                _id: userData._id,
                index_user_id: userData.index_user_id,
                labels: userData.labels
            }
        })
    }
    //PROJECT
    loadMicroProjectData(projectID) {
        return AxiosHelper
            .returnSingleProject(projectID)
            .then(result => this.loadedContentCallback(PROJECT, result.data));
    }

    setContentOnlyData(contentType, content, pursuitNames, username, indexUserID, completeUserID, labels) {
        this.setState({
            contentType: contentType,
            selectedContent: content,
            isContentOnlyView: true,
            visitorUsername: username,
            pursuitNames: pursuitNames,
            targetUser: {
                username: content.username,
                _id: completeUserID,
                index_user_id: indexUserID,
                labels: labels
            }
        })
    }

    loadMicroPostData(postID) {
        return AxiosHelper
            .retrievePost(postID, false)
            .then(result => this.loadedContentCallback(POST, result.data))
            .catch(error => console.log(error))
    }

    handleMediaTypeSwitch(contentType) {
        let feedIDList = null;
        if (this.state.selectedPursuitIndex === 0) {
            switch (contentType) {
                case (POST):
                    feedIDList = this.state.allPosts;
                    break;
                case (PROJECT):
                    feedIDList = this.state.allProjects;
                    break;
                default:
                    throw new Error("Nothing matched for feed type");
            }
        }
        else {
            const feed = this.state.pursuits[this.state.selectedPursuitIndex]
            switch (contentType) {
                case (POST):
                    feedIDList = feed.posts;
                    break;
                case (PROJECT):
                    feedIDList = feed.projects;
                    break;
                default:
                    throw new Error("Nothing matched for feed type");
            }
        }

        this.setState({
            nextOpenPostIndex: 0,
            hasMore: true,
            contentType: contentType,
            feedIDList: feedIDList
        }, () => {
            if (contentType === PROJECT) {
                this.props.history.replace(returnUsernameURL(this.state.targetUser.username) + '/' + PROJECT.toLowerCase())
            }
            else {
                this.props.history.replace(returnUsernameURL(this.state.targetUser.username));
            }
        }
        );
    }

    handleFeedSwitch(index) {
        const feedIDList = this.state.contentType === POST ?
            this.state.pursuits[index].posts
            :
            this.state.pursuits[index].projects;
        console.log(feedIDList);
        this.setState((state) => ({
            selectedPursuitIndex: index,
            selectedPursuit: state.pursuits[index].name,
            feedIDList: feedIDList,
            shouldReloadFeed: true
        }))
    }

    handleFollowerStatusResponse(followerStatusResponse) {
        if (!followerStatusResponse) return null;
        else if (followerStatusResponse.status === 200) {
            if (followerStatusResponse.data.success) {
                if (followerStatusResponse.data.success === FOLLOWED_STATE) {
                    return FOLLOWED_STATE;
                }
                else if (followerStatusResponse.data.success === FOLLOW_REQUESTED_STATE) {
                    return FOLLOW_REQUESTED_STATE;
                }
                else {
                    throw new Error("No Follow State Matched");
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
        return NOT_A_FOLLOWER_STATE;
    }


    renderHeroContent() {
        const selectedPursuit = this.state.pursuits[this.state.selectedPursuitIndex];
        if (this.state.contentType === POST) {
            return (
                <PostController
                    targetUser={this.state.targetUser}
                    returnModalStructure={this.props.returnModalStructure}
                    modalState={this.props.modalState}
                    openMasterModal={this.props.openMasterModal}
                    closeMasterModal={this.props.closeMasterModal}
                    pursuitNames={this.state.pursuitNames}
                    isOwner={this.state.isOwner}
                    selectedPursuitIndex={this.state.selectedPursuitIndex}
                    feedData={selectedPursuit.posts.map((item) => item.post_id)}
                />
            )
        }
        else if (this.state.contentType === PROJECT) {
            return (
                <ProjectController
                    allPosts={this.state.pursuits[0].projects}
                    indexUserID={this.state.targetUser.index_user_id}
                    visitorProfileID={this.state.visitorProfileID}
                    targetUsername={this.state.targetUser.username}
                    visitorUsername={this.state.visitorUsername}
                    contentType={this.state.contentType}
                    onNewBackProjectClick={this.handleNewBackProjectClick}
                    pursuitNames={this.state.pursuitNames}
                    selectedPursuitIndex={this.state.selectedPursuitIndex}

                    isOwnProfile={this.state.isOwner}
                    returnModalStructure={this.props.returnModalStructure}
                    modalState={this.props.modalState}
                    openMasterModal={this.props.openMasterModal}
                    closeMasterModal={this.props.closeMasterModal}
                    feedData={selectedPursuit.projects}
                    labels={this.state.targetUser.labels}
                />)
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
        if (action === FOLLOW_ACTION) {
            this.handleFollowerStatusChange(action);
        }
        else {
            window.confirm("Are you sure you want to unfollow?") &&
                this.handleFollowerStatusChange(action);
        }
    }


    decideHeroContentVisibility() {
        const hideFromAll = !this.props.authUser?.username && this.state.isPrivate;
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
        if (this.state.isContentOnlyView) {
            if (this.state.contentType === POST) {
                return (
                    <ShortPostViewer
                        targetProfileID={this.state.targetUser._id}
                        targetIndexUserID={this.state.targetUser.index_user_id}
                        key={this.state.selectedContent._id}
                        isOwnProfile={this.state.isOwner}
                        visitorUsername={this.state.visitorUsername}
                        largeViewMode={true}
                        isPostOnlyView={this.state.isContentOnlyView}
                        preferredPostPrivacy={this.state.preferredPostPrivacy}
                        postType={this.state.postType}
                        pursuitNames={this.state.pursuitNames}
                        eventData={this.state.selectedContent}
                        textData={this.state.selectedContent.text_data}
                        labels={this.state.targetUser.labels}
                    />
                )
            }
            else if (this.state.contentType === PROJECT) {
                return (
                    <div id="profile-main-container">
                        <ProjectController
                            allPosts={this.state.pursuits ? this.state.pursuits[0].posts : null}
                            indexUserID={this.state.targetUser.index_user_id}
                            targetUsername={this.state.targetUser.username}
                            visitorProfileID={this.state.visitorProfileID}
                            visitorUsername={this.state.visitorUsername}
                            contentType={this.state.contentType}
                            onNewBackProjectClick={this.handleNewBackProjectClick}
                            pursuitNames={this.state.pursuitNames}
                            selectedPursuitIndex={0}

                            isOwnProfile={this.state.isOwner}
                            returnModalStructure={this.props.returnModalStructure}
                            modalState={this.props.modalState}
                            openMasterModal={this.props.openMasterModal}
                            closeMasterModal={this.props.closeMasterModal}
                            feedData={this.state.selectedContent}
                            labels={this.state.targetUser.labels}
                            isContentOnlyView={this.state.isContentOnlyView}
                            priorProjectID={this.state.selectedContent?.ancestors.length > 0 ?
                                this.state.selectedContent.ancestors[this.state.selectedContent.ancestors.length - 1]
                                : null
                            }
                        />
                    </div>
                )
            }
            else {
                throw new Error("No Content Type Matched");
            }
        }
        else if (!this.state.isContentOnlyView) {
            const targetUsername = this.state.targetUser?.username ?? "";
            const targetProfilePhoto = returnUserImageURL(this.state.croppedDisplayPhoto);

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
                                disabled={this.state.contentType === POST ?
                                    true : false}
                                onClick={() => this.handleMediaTypeSwitch(POST)}>
                                Posts
                            </button>
                            <button
                                disabled={this.state.contentType === PROJECT ?
                                    true : false}
                                onClick={() => this.handleMediaTypeSwitch(PROJECT)}>
                                Works
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

export default withRouter(withFirebase(ProfilePage));