import React from 'react';
import { withFirebase } from '../../Firebase';
import PursuitHolder from './sub-components/pursuit-holder';
import AxiosHelper from '../../Axios/axios';
import NoMatch from '../no-match';
import PostViewerController from "../post/viewer/post-viewer-controller";
import FollowButton from "./sub-components/follow-buttons";
import ProjectController from "../project/index";
import { returnUserImageURL, TEMP_PROFILE_PHOTO_URL } from "../constants/urls";
import {
    ALL,
    POST,
    LONG,
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
import PostController from './post-controller';

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
            targetUsername: this.props.match.params.username,
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
            selectedPursuitIndex: -1,
            preferredPostPrivacy: null,
            newProject: false,
            isPostOnlyView: null,
        }
        this.modalRef = React.createRef();
        this.miniModalRef = React.createRef();
        this.renderHeroContent = this.renderHeroContent.bind(this);
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
        if (this._isMounted && this.state.targetUsername) {
            this.props.firebase.auth.onAuthStateChanged(
                (user) => {
                    if (user) {
                        let targetUserInfo = null;
                        AxiosHelper
                            .returnUser(this.state.targetUsername)
                            .then(response => {
                                targetUserInfo = response.data;
                                return user.displayName !== this.state.targetUsername ?
                                    AxiosHelper
                                        .returnFollowerStatus(
                                            user.displayName,
                                            targetUserInfo.user_relation_id
                                        ) : null;
                            })
                            .then((response) => {
                                this.handleResponseData(
                                    user,
                                    targetUserInfo,
                                    response ? response : null
                                );
                            })
                            .catch(err => console.log(err));
                    }
                    else {
                        AxiosHelper
                            .returnUser(this.state.targetUsername)
                            .then(response => this.handleResponseData(user, response.data, null))
                            .catch(err => console.log(err));

                    }
                }
            )
        }
        else if (this._isMounted && this.props.match.params.postID) {
            this.props.firebase.auth.onAuthStateChanged(
                (user) => {
                    if (user) {
                        return Promise.all([
                            AxiosHelper
                                .retrievePost(this.props.match.params.postID, false),
                            AxiosHelper
                                .returnUser(user.displayName)
                        ])
                            .then(
                                (result => {
                                    let pursuitNameArray = [];
                                    for (const pursuit of result[1].data.pursuits) {
                                        pursuitNameArray.push(pursuit.name);
                                    }
                                    if (this._isMounted) this.setState({
                                        selectedEvent: result[0].data,
                                        isPostOnlyView: true,
                                        postType: result[0].data.post_format,
                                        visitorUsername: user.displayName,
                                        targetUsername: result[0].data.username,
                                        pursuitNames: pursuitNameArray,
                                    })
                                })
                            )
                    }
                    else {
                        return AxiosHelper
                            .retrievePost(this.props.match.params.postID, false)
                            .then(
                                (result => {
                                    if (this._isMounted) this.setState({
                                        selectedEvent: result.data,
                                        isPostOnlyView: true,
                                        postType: result.data.post_format,
                                        visitorUsername: null,
                                        targetUsername: result.data.username,
                                        pursuitNames: [],
                                    })
                                })
                            )
                    }
                }
            )
        }
        else {
            throw new Error("No profile or post matched");
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    shouldPull(value) {
        this.setState({ hasMore: value });
    }

    handleMediaTypeSwitch(mediaType) {
        if (this.state.newProject) {
            if (!window.confirm("Do you want to discard your new project?")) return;
            this.setState({ newProject: false });
        }

        if (this.state.selectedPursuitIndex === -1) {
            this.setState((state) => ({
                feedID: ALL + mediaType,
                mediaType: mediaType,
                feedIDList: mediaType === POST ? state.allPosts : state.allProjects
            }));
        }
        else {
            this.setState((state) => ({
                nextOpenPostIndex: 0,
                feedID: state.pursuits[state.selectedPursuitIndex].name + mediaType,
                mediaType: mediaType,
                feedIDList: mediaType === POST ?
                    (state.pursuits[state.selectedPursuitIndex].all_posts ?
                        state.pursuits[state.selectedPursuitIndex].all_posts : [])
                    :
                    (state.pursuits[state.selectedPursuitIndex].all_projects ?
                        state.pursuits[state.selectedPursuitIndex].all_projects : [])
            }));
        }
    }

    handleFeedSwitch(index) {
        if (this.state.newProject) {
            if (!window.confirm("Do you want to discard your new project?")) return;
            this.setState({ newProject: false });
        }
        if (index === -1) {
            this.setState((state) => ({
                hasMore: true,
                nextOpenPostIndex: 0,
                loadedFeed: [[]],
                selectedPursuitIndex: -1,
                feedID: ALL + state.mediaType,
                feedIDList: state.mediaType === POST ? state.allPosts : state.allProjects,

            }));
        }
        else {
            this.setState((state) => ({
                hasMore: true,
                nextOpenPostIndex: 0,
                loadedFeed: [[]],
                selectedPursuitIndex: index,
                feedID: state.pursuits[index].name + state.mediaType,
                feedIDList: state.mediaType === POST ?
                    state.pursuits[index].all_posts ? state.pursuits[index].all_posts : []
                    :
                    state.pursuits[index].all_projects ? state.pursuits[index].all_projects : [],

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

    handleResponseData(user, targetUserInfo, followerStatusResponse) {
        let pursuitNameArray = [];
        let projectArray = [];
        const postsArray = user && user.displayName === targetUserInfo.username ?
            targetUserInfo.all_posts : this.returnPublicPosts(targetUserInfo.all_posts);
        const followerStatus = followerStatusResponse ?
            this.handleFollowerStatusResponse(followerStatusResponse) : null;
        for (const pursuit of targetUserInfo.pursuits) {
            pursuitNameArray.push(pursuit.name);
            if (pursuit.projects) {
                for (const project of pursuit.projects) {
                    projectArray.push(project);
                }
            }
        }

        //set visitor user info and targetUserinfo
        if (this._isMounted) this.setState({
            visitorUsername: user ? user.displayName : null,
            targetUsername: targetUserInfo.username,
            targetProfileID: targetUserInfo._id,
            targetIndexUserID: targetUserInfo.index_user_id,
            targetProfilePreviewID: targetUserInfo.user_preview_id,
            isPrivate: targetUserInfo.private,
            coverPhoto: targetUserInfo.cover_photo_key,
            croppedDisplayPhoto: targetUserInfo.cropped_display_photo_key,
            smallCroppedDisplayPhoto: targetUserInfo.small_cropped_display_photo_key,
            bio: targetUserInfo.bio,
            pinned: targetUserInfo.pinned,
            pursuits: targetUserInfo.pursuits,
            pursuitNames: pursuitNameArray,
            allPosts: postsArray,
            allProjects: projectArray,
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
                targetProfileID={this.state.targetProfileID}
                targetIndexUserID={this.state.targetIndexUserID}
                feedIDList={this.state.feedIDList}
                isOwnProfile={this.state.visitorUsername === this.state.targetUsername}
                visitorUsername={this.state.visitorUsername}
                targetUsername={this.state.targetUsername}
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
            />)
            :
            (<ProjectController
                username={this.state.targetUsername}
                displayPhoto={this.state.smallCroppedDisplayPhoto}
                targetProfileID={this.state.targetProfileID}
                targetIndexUserID={this.state.targetIndexUserID}
                mediaType={this.state.mediaType}
                newProject={this.state.newProject}
                feedID={this.state.feedID}
                allPosts={this.state.feedIDList}
                onNewBackProjectClick={this.handleNewBackProjectClick}
                pursuitNames={this.state.pursuitNames}
            />)
    }

    handleNewBackProjectClick() {
        if (!this.state.newProject) {
            this.setState((state) => ({
                newProject: !state.newProject,
                feedID: NEW_PROJECT,
                feedIDList: state.allPosts
            }));
        }
        else {
            this.setState({ newProject: false }, this.handleMediaTypeSwitch(this.state.mediaType))
        }
    }
    handleFollowerStatusChange(action) {
        AxiosHelper.setFollowerStatus(
            this.state.visitorUsername,
            this.state.userRelationID,
            this.state.targetProfilePreviewID,
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
        const shouldHideProfile = (
            this.state.visitorUsername === null && this.state.isPrivate)
            ||
            (this.state.visitorUsername !== this.state.targetUsername
                && this.state.isPrivate
            )
            && (this.state.followerStatus !== "FOLLOWING" &&
                this.state.followerStatus !== "REQUEST_ACCEPTED");
        let pursuitHolderArray = [
            <PursuitHolder
                key={ALL}
                name={ALL}
                value={-1}
                onFeedSwitch={this.handleFeedSwitch}
            />
        ];
        if (this.state.fail) return NoMatch;
        if (this.state.pursuits) {
            let index = 0;
            for (const pursuit of this.state.pursuits) {
                pursuitHolderArray.push(
                    <PursuitHolder
                        name={pursuit.name}
                        numEvents={pursuit.num_posts}
                        key={pursuit.name} value={index++}
                        onFeedSwitch={this.handleFeedSwitch} />
                );
            }
        }
        if (this.state.isPostOnlyView) {
            return (
                <PostViewerController
                    targetProfileID={this.state.targetProfileID}
                    targetIndexUserID={this.state.targetIndexUserID}
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
                    textData={
                        this.state.selectedEvent.post_format === LONG ?
                            JSON.parse(this.state.selectedEvent.text_data) :
                            this.state.selectedEvent.text_data
                    }
                />
            )
        }
        else if (!this.state.isPostOnlyView) {
            return (
                <div>
                    <div id="profile-main-container">
                        <div id="profile-cover-photo-container">
                            {
                                this.state.coverPhoto ?
                                    (<img
                                        alt="cover photo"
                                        src={returnUserImageURL(
                                            this.state.coverPhoto)}
                                    ></img>
                                    ) : (
                                        <div id="profile-temp-cover"></div>
                                    )
                            }
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
                                    <h4>{this.state.targetUsername}</h4>
                                </div>
                                <div id="profile-follow-actions-container">
                                    <FollowButton
                                        isOwner={this.state.targetUsername === this.state.visitorUsername}
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