import React from 'react';
import { withRouter } from 'react-router-dom';
import PursuitHolder from './sub-components/pursuit-holder';
import AxiosHelper from 'utils/axios';
import { AuthUserContext } from 'store/session';
import FollowButton from './sub-components/follow-buttons';
import ProjectController from '../project/index';
import PostController from '../post/post-controller';
import CoverPhoto from './sub-components/cover-photo';
import { withFirebase } from 'store/firebase';
import { returnUserImageURL, returnUsernameURL } from 'utils/url';
import {
    POST,
    PROJECT,
    PRIVATE,
    NOT_A_FOLLOWER_STATE,
    FOLLOW_ACTION,
    UNFOLLOWED_STATE,
    FOLLOW_REQUESTED_STATE,
    FOLLOWED_STATE
} from 'utils/constants/flags';
import './index.scss';
import ShortPostViewer from '../post/viewer/short-post';

const createPursuitArray = (pursuits) => {
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
            isPrivate: true,
            coverPhoto: '',
            bio: '',
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
            selectedPursuit: 'ALL',
            selectedPursuitIndex: 0,
            preferredPostPrivacy: null,
            isContentOnlyView: null,
            loading: true,
            target: {
                username: this.props.match?.params?.username ?? null,
            }
        }

        this.decideHeroContentVisibility = this.decideHeroContentVisibility.bind(this);
        this.loadMacroProjectData = this.loadMacroProjectData.bind(this);
        this.loadMicroProjectData = this.loadMicroProjectData.bind(this);
        this.loadMicroPostData = this.loadMicroPostData.bind(this);
        this.setContentOnlyData = this.setContentOnlyData.bind(this);
        this.renderHeroContent = this.renderHeroContent.bind(this);
        this.handleFollowClick = this.handleFollowClick.bind(this);
        this.handleFollowerStatusChange = this.handleFollowerStatusChange.bind(this);
        this.handlePursuitToggle = this.handlePursuitToggle.bind(this);
        this.handleMediaTypeSwitch = this.handleMediaTypeSwitch.bind(this);
        this.loadProfile = this.loadProfile.bind(this);
        this.setProfileData = this.setProfileData.bind(this);
        this.loadFollowerStatus = this.loadFollowerStatus.bind(this);
        this.loadedContentCallback = this.loadedContentCallback.bind(this);
        this.isOwner = this.isOwner.bind(this);
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
        const isSamePage = username !== this.state.target?.username;
        const isViewingPost = this.props.match.params.postID ? true : false;
        const isViewingProject = this.props.match.params.projectID ? true : false;
        const isNewURL = !this.state.fail && isSamePage && !isViewingPost && !isViewingProject;
        if (isNewURL) {
            return this.loadProfile(username, POST);
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    loadMacroProjectData(username) {
        let userData = null;
        return AxiosHelper
            .returnUser(username)
            .then((result) => {
                userData = result.data;
                return this.loadFollowerStatus(
                    userData.user_relation_id,
                    userData.private)
            })
    }

    isOwner() {
        if (!this.props.authUser) return false;
        if (this.state.isContentOnlyView) {
            console.log('hits')
            return this.state.selectedContent.username === this.props.authUser.username;
        }
        else return this.props.authUser.username === this.state.target.username;
    }

    loadProfile(username, contentType) {
        let userData = null;
        return AxiosHelper
            .returnUser(username)
            .then((result) => {
                userData = result.data;
                return this.loadFollowerStatus(
                    userData.user_relation_id,
                    userData.private)
            })
            .then((result) =>
                this.setProfileData(
                    userData,
                    result?.data ?? null,
                    contentType
                ))
            .catch((err) => {
                console.log(err);
                this.setState({ fail: true });
            });
    }

    loadFollowerStatus(userRelationID, isPrivate) {
        if (this.isOwner()) {
            return null;
        }
        else if (!isPrivate) {
            return null;
        }
        else if (isPrivate) {
            return AxiosHelper
                .returnFollowerStatus(
                    this.props.authUser.username,
                    userRelationID);
        }
    }


    loadedContentCallback(contentType, data) {
        const content = contentType === POST ? data : data.project;
        if (this.props.authUser) {
            const authUser = this.props.authUser;
            const pursuitData = createPursuitArray(authUser.pursuits);
            this.setContentOnlyData(
                contentType,
                content,
                pursuitData.names,
            )
        }
        else {
            this.setContentOnlyData(
                contentType,
                content
            )
        }
    }

    setProfileData(userData, rawFollowerState, contentType) {
        const pursuitData = createPursuitArray(userData.pursuits);
        const followerStatus = this.handleFollowerStatusResponse(rawFollowerState);
        console.log(followerStatus);
        this.setState({
            target: userData,
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
            loading: false
        })
    }
    //PROJECT
    loadMicroProjectData(projectID) {
        return AxiosHelper
            .returnSingleProject(projectID)
            .then(result => this.loadedContentCallback(PROJECT, result.data));
    }

    setContentOnlyData(contentType, content, pursuitNames) {
        this.setState({
            contentType: contentType,
            selectedContent: content,
            pursuitNames: pursuitNames,
            isContentOnlyView: true,
            loading: false
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
                    throw new Error('Nothing matched for feed type');
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
                    throw new Error('Nothing matched for feed type');
            }
        }

        this.setState({
            nextOpenPostIndex: 0,
            hasMore: true,
            contentType: contentType,
            feedIDList: feedIDList
        }, () => {
            if (contentType === PROJECT) {
                this.props.history.replace(returnUsernameURL(this.state.target.username) + '/' + PROJECT.toLowerCase())
            }
            else {
                this.props.history.replace(returnUsernameURL(this.state.target.username));
            }
        });
    }

    handlePursuitToggle(index) {
        const feedIDList = this.state.contentType === POST ?
            this.state.pursuits[index].posts
            :
            this.state.pursuits[index].projects;
        this.setState((state) => ({
            selectedPursuitIndex: index,
            selectedPursuit: state.pursuits[index].name,
            feedIDList: feedIDList,
            shouldReloadFeed: true
        }))
    }

    handleFollowerStatusResponse(followerStatusResponse) {
        if (!followerStatusResponse) return NOT_A_FOLLOWER_STATE;
        else if (followerStatusResponse.status === 200) {
            if (followerStatusResponse.data.success) {
                if (followerStatusResponse.data.success === FOLLOWED_STATE) {
                    return FOLLOWED_STATE;
                }
                else if (followerStatusResponse.data.success === FOLLOW_REQUESTED_STATE) {
                    return FOLLOW_REQUESTED_STATE;
                }
                else {
                    throw new Error('No Follow State Matched');
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
                    authUser={this.props.authUser}
                    returnModalStructure={this.props.returnModalStructure}
                    modalState={this.props.modalState}
                    openMasterModal={this.props.openMasterModal}
                    closeMasterModal={this.props.closeMasterModal}
                    pursuitNames={this.state.pursuitNames}
                    selectedPursuitIndex={this.state.selectedPursuitIndex}
                    feedData={selectedPursuit.posts.map((item) => item.content_id)}
                />
            )
        }
        else if (this.state.contentType === PROJECT) {
            return (
                <ProjectController
                    authUser={this.props.authUser}
                    content={this.state.pursuits[this.state.selectedPursuitIndex]}
                    pursuitNames={this.state.pursuitNames}
                    isContentOnlyView={this.state.isContentOnlyView}
                    returnModalStructure={this.props.returnModalStructure}
                    modalState={this.props.modalState}
                    openMasterModal={this.props.openMasterModal}
                    closeMasterModal={this.props.closeMasterModal}
                />)
        }

    }

    handleFollowerStatusChange(action) {
        AxiosHelper.setFollowerStatus(
            this.props.authUser.username,
            this.state.userRelationID,
            this.state.target.user_preview_id,
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
            window.confirm('Are you sure you want to unfollow?') &&
                this.handleFollowerStatusChange(action);
        }
    }


    decideHeroContentVisibility() {
        const hideFromAll = !this.props.authUser?.username && this.state.isPrivate;
        const hideFromUnauthorized = (!this.isOwner() && this.state.isPrivate)
            && (this.state.followerStatus !== 'FOLLOWING' &&
                this.state.followerStatus !== 'REQUEST_ACCEPTED');
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
        if (this.state.loading) return null;
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
                        onPursuitToggle={this.handlePursuitToggle} />
                );
            }
        }
        if (this.state.isContentOnlyView) {
            if (this.state.contentType === POST) {
                const formattedTextData = this.state.selectedContent?.text_data && this.state.selectedContent.is_paginated ?
                    JSON.parse(this.state.selectedContent.text_data) : this.state.selectedContent.text_data;
                return (
                    <ShortPostViewer
                        authUser={this.props.authUser}
                        key={this.state.selectedContent._id}
                        largeViewMode={true}
                        isPostOnlyView={this.state.isContentOnlyView}
                        preferredPostPrivacy={this.state.preferredPostPrivacy}
                        postType={this.state.postType}
                        pursuitNames={this.state.pursuitNames}
                        eventData={this.state.selectedContent}
                        textData={formattedTextData}
                    />
                )
            }
            else if (this.state.contentType === PROJECT) {
                return (
                    <div id='profile-main-container'>
                        <ProjectController
                            authUser={this.props.authUser}
                            content={this.state.selectedContent}
                            pursuitNames={this.state.pursuitNames}
                            returnModalStructure={this.props.returnModalStructure}
                            modalState={this.props.modalState}
                            openMasterModal={this.props.openMasterModal}
                            closeMasterModal={this.props.closeMasterModal}
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
                throw new Error('No Content Type Matched');
            }
        }
        else if (!this.state.isContentOnlyView) {
            const targetUsername = this.state.target?.username ?? '';
            const targetProfilePhoto = returnUserImageURL(this.props.authUser?.croppedDisplayPhotoKey??null);
            return (
                <div>
                    <div id='profile-main-container'>
                        <div id='profile-cover-photo-container'>
                            <CoverPhoto coverPhoto={this.state.coverPhoto} />
                        </div>
                        <div id='profile-intro-container'>
                            <div id='profile-display-photo-container'>
                                <img
                                    alt='user profile photo'
                                    src={targetProfilePhoto}
                                />

                                <div id='profile-name-container'>
                                    <h4>{targetUsername}</h4>
                                </div>
                                <div id='profile-follow-actions-container'>
                                    <FollowButton
                                        isOwner={this.isOwner()}
                                        followerStatus={this.state.followerStatus}
                                        onFollowClick={this.handleFollowClick}
                                        onOptionsClick={this.handleOptionsClick}
                                    />
                                </div>
                            </div>
                            <div id='profile-biography'>
                                {this.state.bio ? <p>{this.state.bio}</p> : <p></p>}
                            </div>
                            <div id='profile-pursuits-container'>
                                {pursuitHolderArray}
                            </div>
                        </div>

                        <div id='profile-content-switch-container'>
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
                        {this.state.contentType && this.decideHeroContentVisibility()}
                    </div>

                </div>
            );
        }
        else {
            return new Error('State condition for postOnlyView was null');
        }

    }
}

export default withRouter(withFirebase(ProfilePage));