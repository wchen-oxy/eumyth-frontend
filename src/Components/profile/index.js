import React from 'react';
import { withFirebase } from '../../Firebase';
import PursuitHolder from './sub-components/pursuit-holder';
import AxiosHelper from '../../Axios/axios';
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

class ProfilePage extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            hasMore: true,
            nextOpenPostIndex: 0,
            loadedFeed: [[]],
            visitorUsername: null,
            targetProfileID: null,
            targetProfilePreviewID: null,
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

    //fixme add catch for no found anything
    componentDidMount() {
        this._isMounted = true;
        const targetUsername = this.props.match.params.username;
        if (this._isMounted && targetUsername) {
            this.props.firebase.auth.onAuthStateChanged(
                (user) => this.loadInitialProfileData(user, targetUsername)
            )
        }
        else if (this._isMounted && this.props.match.params.postID) {
            this.props.firebase.auth.onAuthStateChanged(
                (user) => this.loadInitialProfileData(user.displayName)
            )
        }
        else {
            throw new Error("No profile or post matched");
        }
    }

    componentDidUpdate() {
        if (!this.state.fail && this.props.match.params.username !== this.state.targetUser.username) {
            AxiosHelper
                .returnUser(this.state.targetUser.username)
                .then(
                    this.handleLoadUser(this.props.firebase.returnUsername(), this.props.match.params.username)
                )

        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    loadInitialProfileData(user, targetUsername) {
        if (user) {
            this.handleLoadUser(user.displayName, targetUsername)
        }
        else {
            AxiosHelper
                .returnUser(targetUsername)
                .then(response =>
                    this.handleResponseData(user, response.data, null)
                )
                .catch(error => {
                    console.log(error)
                });
        }
    }

    setInitialPostData(post, pursuitNames, username) {
        this.setState({
            selectedEvent: post,
            isPostOnlyView: true,
            postType: post.post_format,
            visitorUsername: username,
            targetUsername: post.username,
            pursuitNames: pursuitNames,
        })
    }

    loadInitialPostData(username) {
        if (username) {
            return Promise.all([
                AxiosHelper
                    .retrievePost(this.props.match.params.postID, false),
                AxiosHelper
                    .returnUser(username)
            ])
                .then(result => {
                    const pursuitData = createPusuitArray(result[1].data.pursuits);
                    this.setInitialPostData(
                        result[0].data,
                        pursuitData.names,
                        username
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

        //set visitor user info and targetUserinfo
        this.setState({
            visitorUsername: displayName ? displayName : null,
            targetUser: targetUserInfo,
            targetProfileID: targetUserInfo._id,
            targetIndexUserID: targetUserInfo.index_user_id,
            targetProfilePreviewID: targetUserInfo.user_preview_id,
            fail: targetUserInfo ? false : true,
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
            (<PostController
                feedID={this.state.feedID}
                targetProfileID={this.state.targetUser._id}
                targetIndexUserID={this.state.targetUser.index_user_id}
                feedIDList={this.state.feedIDList}
                isOwnProfile={this.state.visitorUsername === this.state.targetUser.username}
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

                returnModalStructure={this.props.returnModalStructure}
                modalState={this.props.modalState}
                openMasterModal={this.props.openMasterModal}
                closeMasterModal={this.props.closeMasterModal}
            />)
            :
            (<ProjectController
                username={this.state.targetUser.username}
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


    render() {
        if (this.state.fail) return NoMatch;
        const isOwner = this.state.targetUser ? this.state.targetUser.username === this.state.visitorUsername : true;
        const shouldHideProfile = (
            this.state.visitorUsername === null && this.state.isPrivate)
            ||
            (!isOwner && this.state.isPrivate)
            && (this.state.followerStatus !== "FOLLOWING" &&
                this.state.followerStatus !== "REQUEST_ACCEPTED");
        let pursuitHolderArray = [];
        // let pursuitHolderArray = [
        //     <PursuitHolder
        //         key={ALL}
        //         name={ALL}
        //         value={-1}
        //         onFeedSwitch={this.handleFeedSwitch}
        //     />
        // ];

        if (this.state.pursuits) {
            let index = 0;
            for (const pursuit of this.state.pursuits) {
                // const pursuit = this.state.pursuits[i];
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
                    isOwnProfile={this.state.visitorUsername === this.state.selectedEvent.username}
                    visitorUsername={this.state.visitorUsername}
                    largeViewMode={true}
                    isPostOnlyView={this.state.isPostOnlyView}
                    visitorDisplayPhoto={this.state.smallCroppedDisplayPhoto}
                    preferredPostPrivacy={this.state.preferredPostPrivacy}
                    postType={this.state.postType}
                    pursuitNames={this.state.pursuitNames}
                    eventData={this.state.selectedEvent}
                    textData={this.state.selectedEvent.text_data}
                />
            )
        }
        else if (!this.state.isPostOnlyView) {
            return (
                <div>
                    <div id="profile-main-container">
                        <div id="profile-cover-photo-container">
                            <CoverPhoto coverPhoto={this.state.coverPhoto} />
                            {/* {
                                this.state.coverPhoto ?
                                    (<img
                                        alt="cover photo"
                                        src={returnUserImageURL(
                                            this.state.coverPhoto)}
                                    ></img>
                                    ) : (
                                        <div id="profile-temp-cover"></div>
                                    )
                            } */}
                        </div>
                        <div id="profile-intro-container">
                            <div id="profile-display-photo-container">
                                <img
                                    alt="user profile photo"
                                    src={
                                        this.state.croppedDisplayPhoto ?
                                            returnUserImageURL(
                                                this.state.croppedDisplayPhoto)
                                            :
                                            TEMP_PROFILE_PHOTO_URL
                                    }
                                ></img>

                                <div id="profile-name-container">
                                    <h4>{this.state.targetUser ? this.state.targetUser.username : ""}</h4>
                                </div>
                                <div id="profile-follow-actions-container">
                                    <FollowButton
                                        isOwner={isOwner}
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
                        {
                            shouldHideProfile
                                ?
                                <p>This profile is private. To see
                                    these posts, please request access. </p>
                                :
                                this.renderHeroContent()

                        }
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