import React from 'react';
import PursuitHolder from './sub-components/pursuit-holder';
import AxiosHelper from 'utils/axios';
import { AuthUserContext } from 'store/session';
import FollowButton from './sub-components/follow-buttons';
import PostController from '../post/index';
import ProjectController from '../project/index';
import CoverPhoto from './sub-components/cover-photo';
import { withFirebase } from 'store/firebase';
import { returnUserImageURL, returnUsernameURL } from 'utils/url';
import withRouter from 'utils/withRouter';
import {
    POST,
    PROJECT,
    PRIVATE,
    NOT_A_FOLLOWER_STATE,
    FOLLOW_ACTION,
    UNFOLLOWED_STATE,
    FOLLOW_REQUESTED_STATE,
    FOLLOWED_STATE,
    THREADS
} from 'utils/constants/flags';
import { createPursuitArray, formatPostText } from 'utils';
import HeroContentDecider from './hero-content-decider';

const selectMessage = (action, isPrivate) => {
    switch (action) {
        case ("FOLLOW"):
            if (isPrivate) {
                return FOLLOW_REQUESTED_STATE;
            }
            else return FOLLOWED_STATE;
        case ('UNFOLLOW'):
            return NOT_A_FOLLOWER_STATE;
        default:
            break;
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
            pursuits: null,
            allPosts: null,
            allProjects: null,
            fail: false,
            textData: null,
            userRelationID: null,
            followerStatus: null,
            feedIDList: null,
            contentType: null,
            selectedContent: null,
            selectedPursuit: 'ALL',
            selectedPursuitIndex: 0,
            preferredPostPrivacy: null,
            isContentOnlyView: null,
            loading: true,
            profileData: {
                username: this.props.match?.params?.username ?? null,
            }
        }

        this.loadMacroProjectData = this.loadMacroProjectData.bind(this);
        this.loadMicroProjectData = this.loadMicroProjectData.bind(this);
        this.loadMicroPostData = this.loadMicroPostData.bind(this);
        this.setContentOnlyData = this.setContentOnlyData.bind(this);
        this.handleFollowClick = this.handleFollowClick.bind(this);
        this.handleFollowerStatusChange = this.handleFollowerStatusChange.bind(this);
        this.handlePursuitToggle = this.handlePursuitToggle.bind(this);
        this.handleMediaTypeSwitch = this.handleMediaTypeSwitch.bind(this);
        this.loadProfile = this.loadProfile.bind(this);
        this.setProfileData = this.setProfileData.bind(this);
        this.loadedContentCallback = this.loadedContentCallback.bind(this);
        this.isOwner = this.isOwner.bind(this);
    }

    componentDidMount() {
        this._isMounted = true;
        const params = this.props.match;
        const targetUsername = params.username;
        const requestedPostID = params.postID;
        const requestedProjectID = params.projectID;
        const isPostMacroView = targetUsername ? true : false;
        const isPostMicroView = requestedPostID ? POST : null;
        const isProjectMacroView = this.props.isProjectView;
        const isProjectMicroView = requestedProjectID ? PROJECT : null;

        if (this._isMounted) {
            if (isProjectMacroView) {
                return this.loadProfile(targetUsername, PROJECT);
            }
            else if (isPostMacroView) {
                return this.loadProfile(targetUsername, POST);
            }
            else if (isPostMicroView) {
                return this.loadMicroPostData(requestedPostID)
            }
            else if (isProjectMicroView) {
                return this.loadMicroProjectData(requestedProjectID);
            }
        }

    }

    componentDidUpdate() {
        const username = this.props.match.username;
        const isSamePage = username !== this.state.profileData?.username;
        const isViewingPost = this.props.match.postID ? true : false;
        const isViewingProject = this.props.match.projectID ? true : false;
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
            return this.state.selectedContent.username === this.props.authUser.username;
        }
        else return this.props.authUser.username === this.state.profileData.username;
    }

    loadProfile(username, contentType) {
        let userData = null;
        return AxiosHelper
            .returnUser(username)
            .then((result) => {
                userData = result.data;
                return AxiosHelper
                    .returnFollowerStatus(
                        this.props.authUser.username,
                        userData.user_relation_id)
            })
            .then((followerStatus) =>
                this.setProfileData(
                    userData,
                    followerStatus,
                    contentType
                ))
            .catch((err) => {
                console.log(err);
                this.setState({ fail: true });
            });
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
        this.setState({
            profileData: userData,
            pursuitNames: pursuitData.names,
            followerStatus: followerStatus,
            contentType: contentType,
            isContentOnlyView: false,
            isPrivate: userData.private,
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
        let numOfContent = null;
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
            const feed = this.state.profileData.pursuits[this.state.selectedPursuitIndex]
            switch (contentType) {
                case (POST):
                    feedIDList = feed.posts;
                    numOfContent = feed.num_posts;
                    break;
                case (PROJECT):
                    feedIDList = feed.projects;
                    numOfContent = feed.num_posts;
                    break;
                default:
                    throw new Error('Nothing matched for feed type');
            }
        }

        this.setState({
            contentType: contentType,
            feedIDList: feedIDList,
            numOfContent: numOfContent,
        },
            () => {
                if (contentType === PROJECT) {
                    this.props.navigate(returnUsernameURL(this.state.profileData.username) + '/' + THREADS.toLowerCase(), { replace: false });
                }
                else {
                    this.props.navigate(returnUsernameURL(this.state.profileData.username), { replace: false });
                }
            });
    }

    handlePursuitToggle(index) {
        const feedIDList = this.state.contentType === POST ?
            this.state.profileData.pursuits[index].posts
            :
            this.state.profileData.pursuits[index].projects;
        this.setState((state) => ({
            selectedPursuitIndex: index,
            selectedPursuit: state.profileData.pursuits[index].name,
            feedIDList: feedIDList,

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

    handleFollowerStatusChange(action) {
        AxiosHelper.setFollowerStatus(
            this.props.authUser.userRelationID,
            this.state.profileData.user_relation_id,
            action,
            this.state.profileData.private,
        )
            .then((result) => {
                const message = selectMessage(action, this.state.profileData.private);
                this.setState({ followerStatus: message })

            })
            .catch((error) => {
                console.log(error);
                alert(error);
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

    render() {
        if (this.state.loading) return null;
        let index = 0;
        const pursuitHolderArray = [];
        if (this.state.profileData.pursuits) {
            for (const pursuit of this.state.profileData.pursuits) {
                pursuitHolderArray.push(
                    <PursuitHolder
                        isSelected={pursuit.name === this.state.selectedPursuit}
                        name={pursuit.name}
                        numEvents={pursuit.posts.length}
                        key={pursuit.name}
                        value={index++}
                        onPursuitToggle={this.handlePursuitToggle} />
                );
            }
        }
        if (this.state.isContentOnlyView) {
            if (this.state.contentType === POST) {
                const formattedTextData = formatPostText(this.state.selectedContent);
                const viewerObject = {
                    key: this.state.selectedContent._id,
                    largeViewMode: true,
                    textData: formattedTextData,
                    isPostOnlyView: this.state.isContentOnlyView,
                    pursuitNames: this.state.pursuitNames,
                    eventData: this.state.selectedContent,
                    projectPreviewMap: {}
                }
                return (
                    <PostController
                        isViewer
                        authUser={this.props.authUser}
                        viewerObject={viewerObject}
                    />
                )
            }
            else if (this.state.contentType === PROJECT) {
                return (
                    <div id='profile-main'>
                        <ProjectController
                            authUser={this.props.authUser}
                            content={this.state.selectedContent}
                            pursuitNames={this.state.pursuitNames}
                            returnModalStructure={this.props.returnModalStructure}
                            modalState={this.props.modalState}
                            openMasterModal={this.props.openMasterModal}
                            closeMasterModal={this.props.closeMasterModal}
                            isContentOnlyView={this.state.isContentOnlyView}

                        />
                    </div>
                )
            }
            else {
                throw new Error('No Content Type Matched');
            }
        }
        else if (!this.state.isContentOnlyView) {
            const targetUsername = this.state.profileData?.username ?? '';
            const targetProfilePhoto = returnUserImageURL(this.state.profileData?.cropped_display_photo_key ?? null);
            const hideFromAll = !this.props.authUser?.username
                && this.state.profileData.private;
            const hideFromUnauthorized = (!this.isOwner()
                && this.state.profileData.private)
                && (this.state.followerStatus !== 'FOLLOWING' &&
                    this.state.followerStatus !== 'REQUEST_ACCEPTED');
            const specificContent = {}

            if (this.state.contentType === POST) {
                const selectedPursuit = this.state.profileData
                    .pursuits[this.state.selectedPursuitIndex];
                specificContent.feedData = selectedPursuit.posts.map((item) => item.content_id);
            }

            else if (this.state.contentType === PROJECT) {
                specificContent.content = this.state.profileData.pursuits[this.state.selectedPursuitIndex];
                specificContent.selectedPursuitIndex = this.state.selectedPursuitIndex;
                specificContent.isContentOnlyView = this.state.isContentOnlyView;
            }

            return (
                <div>
                    <div id='profile-main'>
                        <div id='profile-cover'>
                            <CoverPhoto coverPhotoKey={this.state.profileData.cover_photo_key} />
                        </div>
                        <div id='profile-intro'>
                            <div id='profile-dp'>
                                <img
                                    alt='user profile'
                                    src={targetProfilePhoto}
                                />
                                <div id='profile-name'>
                                    <h4>{targetUsername}</h4>
                                </div>
                                <div id='profile-actions'>
                                    <FollowButton
                                        isOwner={this.isOwner()}
                                        followerStatus={this.state.followerStatus}
                                        onFollowClick={this.handleFollowClick}
                                        onOptionsClick={this.handleOptionsClick}
                                    />
                                </div>
                            </div>
                            <div id='profile-biography'>
                                {this.state.profileData.bio && <p>{this.state.profileData.bio}</p>}
                            </div>
                            <div id='profile-pursuits'>
                                {pursuitHolderArray}
                            </div>
                        </div>

                        <div id='profile-content-switch'>
                            <button
                                className="btn-switch"
                                disabled={this.state.contentType === POST ?
                                    true : false}
                                onClick={() => this.handleMediaTypeSwitch(POST)}>
                                Posts
                            </button>
                            <button
                                className="btn-switch"
                                disabled={this.state.contentType === PROJECT ?
                                    true : false}
                                onClick={() => this.handleMediaTypeSwitch(PROJECT)}>
                                Series
                            </button>
                        </div>
                        {this.state.contentType &&
                            <HeroContentDecider
                                {...specificContent}
                                contentType={this.state.contentType}
                                visibility={{
                                    shouldHide: hideFromAll || hideFromUnauthorized,
                                    fail: this.state.fail
                                }}
                                authUser={this.props.authUser}
                                returnModalStructure={this.props.returnModalStructure}
                                modalState={this.props.modalState}
                                openMasterModal={this.props.openMasterModal}
                                closeMasterModal={this.props.closeMasterModal}
                                pursuitNames={this.state.pursuitNames}
                                feedID={this.state.selectedPursuitIndex}
                                numOfContent={this.state.numOfContent}
                            />
                        }
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