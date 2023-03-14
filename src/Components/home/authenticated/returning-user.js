import React from 'react';
import AxiosHelper from 'utils/axios';
import {  toTitleCase } from 'utils';
import { withAuthorization } from 'store/session';
import { withFirebase } from 'store/firebase';
import withRouter from "utils/withRouter"; 
import { RECENT_POSTS,  POST_VIEWER_MODAL_STATE, SHORT,   } from 'utils/constants/flags';
import FriendFeed from './friend-feed';
import ExtraFeed from './extra-feed';
import Header from './header';

class ReturningUserPage extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            username: this.props.firebase.returnUsername(),
            name: {
                first: null,
                last: null
            },
            pursuitObjects: null,
            croppedDisplayPhoto: null,
            smallCroppedDisplayPhoto: null,
            indexUserDataID: null,
            fullUserDataID: null,
            preferredPostPrivacy: null,
            followedUserPostIDs: [],
            nextOpenPostIndex: 0,
            isModalShowing: false,
            selectedEvent: null,
            textData: '',
            recentPosts: null,
            recentPostsKey: 0,
            isExtraFeedToggled: false,

            cached: null
        }

        this.handlePursuitClick = this.handlePursuitClick.bind(this);
        this.handleRecentWorkClick = this.handleRecentWorkClick.bind(this);
        this.handleEventClick = this.handleEventClick.bind(this);
        this.setModal = this.setModal.bind(this);
        this.createPursuits = this.createPursuits.bind(this);
        this.passDataToModal = this.passDataToModal.bind(this);
        this.clearModal = this.clearModal.bind(this);
        this.handleDeletePost = this.handleDeletePost.bind(this);
        this.toggleFeedState = this.toggleFeedState.bind(this);
        this.setExtraFeedModal = this.setExtraFeedModal.bind(this);
    }

    componentDidMount() {
        this._isMounted = true;
        if (this._isMounted && this.state.username) {
            const pursuitObjects =
                this.createPursuits(this.props.authUser.pursuits);
            const promisedCached =
                AxiosHelper.getCachedFeed(this.props.authUser.cached_feed_id);
            const promisedFullName = this.props.firebase.returnName();
            Promise.all([promisedCached, promisedFullName]).then(
                results => {
                    this.setState({
                        cached: results[0].data,
                        name: {
                            first: results[1].firstName,
                            last: results[1].lastName
                        },
                        pursuitObjects: pursuitObjects
                    })
                }
            )
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    toggleFeedState(isExtraFeedToggled) {
        this.setState({ isExtraFeedToggled: !isExtraFeedToggled })
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

    passDataToModal(data, type, postIndex) { //TO DELETE
        this.setState({
            selectedEvent: data,
            textData: data.text_data,
            selectedPostFeedType: RECENT_POSTS,
            selectedPostIndex: postIndex,
        }, this.setModal())
    }

    setModal() { //TO DELETE
        this.props.openMasterModal(POST_VIEWER_MODAL_STATE);
    }

    setExtraFeedModal(data, type, index) {
        this.setState({
            selectedEvent: data,
            textData: data.text_data,
            selectedPostFeedType: SHORT,
            selectedPostIndex: index,
        }, this.setModal())
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

    handleEventClick(selectedEvent, selectedPostIndex, type) {
        if (this._isMounted) {
            this.setState({
                selectedEvent,
                selectedPostIndex,
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

    // renderModal() {
    //     if (this.props.modalState === POST_VIEWER_MODAL_STATE &&
    //         this.state.selectedEvent) {
    //         const formattedTextData = formatPostText(this.state.selectedEvent);

    //         const viewerObject = {
    //             key: this.state.selectedPostIndex,
    //             largeViewMode: true,
    //             textData: formattedTextData,
    //             isPostOnlyView: false,
    //             pursuitNames: this.state.pursuitObjects.names,
    //             eventData: this.state.selectedEvent,
    //             selectedPostFeedType: this.state.selectedPostFeedType,
    //             postIndex: this.state.selectedPostIndex,
    //         };
    //         const content = (
    //             <PostController
    //                 isViewer
    //                 viewerObject={viewerObject}
    //                 authUser={this.props.authUser}
    //                 closeModal={this.clearModal}
    //             />
    //         );
    //         return this.props.returnModalStructure(
    //             content,
    //             this.clearModal
    //         );
    //     }
    //     else {
    //         return null;
    //     }
    // }

    render() {
        let pursuitProps = null;
        if (this.state.pursuitObjects) {
            pursuitProps = {
                pursuitNames: this.state.pursuitObjects.names,
                pursuitObjects: this.state.pursuitObjects
            }
        }
        const modalProps = {
            modalState: this.props.modalState,
            openMasterModal: this.props.openMasterModal,
            closeMasterModal: this.props.closeMasterModal,
            returnModalStructure: this.props.returnModalStructure
        }
        return (
            <div id='returninguser'>
                <Header
                    displayPhotoKey={this.props.authUser.croppedDisplayPhotoKey}
                    username={this.props.authUser.username}
                    name={this.state.name}
                    pursuitObjects={this.state.pursuitObjects}
                />
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
                        !this.state.isExtraFeedToggled
                        && this.state.cached
                        &&
                        <div id='returninguser-infinite-scroll'>
                            <FriendFeed
                                authUser={this.props.authUser}
                                following={this.state.cached.following}
                                nextOpenPostIndex={this.state.nextOpenPostIndex}
                                fetchNextPosts={this.fetchNextPosts}
                                {...pursuitProps}
                                {...modalProps}

                            />
                        </div>
                    }
                    {
                        this.state.isExtraFeedToggled &&
                        <ExtraFeed
                            authUser={this.props.authUser}
                            cached={this.state.cached}
                            {...pursuitProps}
                            {...modalProps}
                        />
                    }
                </div>
            </div>
        )
    }
}

const handleCheckUser = () => {
    this.props.firebase.checkIsExistingUser()
}

const condition = authUser => !!authUser && withFirebase(handleCheckUser);
export default withAuthorization(condition)(withRouter(ReturningUserPage));
