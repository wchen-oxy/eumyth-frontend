import React from 'react';
import AxiosHelper from 'utils/axios';
import { returnUserImageURL, returnUsernameURL } from 'utils/url';
import {
    UNFOLLOW_ACTION,
    ACCEPT_ACTION,
    DECLINE_ACTION,
    FOLLOW_REQUESTED_STATE
} from 'utils/constants/flags';
import {
    ACCEPT_REQUEST_TEXT,
    DECLINE_REQUEST_TEXT,
    CANCEL_REQUEST_TEXT,
    FOLLOWING_BUTTON_TEXT,
    REQUESTED_BUTTON_TEXT,
} from 'utils/constants/ui-text';
import './relation-modal.scss';

class RelationModal extends React.Component {
    _isMounted = false;
    constructor() {
        super();
        this.state = {
            userRelationID: null,
            following: [],
            followers: [],
            requested: []
        }
        this.handleStatusChange = this.handleStatusChange.bind(this);
        this.handleRenderRelation = this.handleRenderRelation.bind(this);
        this.renderUserRow = this.renderUserRow.bind(this);
    }

    componentDidMount() {
        this._isMounted = true;
        AxiosHelper.returnUserRelationInfo(this.props.username)
            .then((result) => {
                if (this._isMounted) {
                    const falseRequest = { exists: false };
                    const following = this.handleRenderRelation(
                        this.renderUserRow,
                        result.data.following,
                        falseRequest);
                    const followers = this.handleRenderRelation(
                        this.renderUserRow,
                        result.data.followers,
                        falseRequest);
                    const requested = this.handleRenderRelation(
                        this.renderUserRow,
                        result.data.requested,
                        { exists: true, type: 'REQUESTED' });
                    const requester = this.handleRenderRelation(
                        this.renderUserRow,
                        result.data.requester,
                        { exists: true, type: 'REQUESTER' });
                    this.setState({
                        userRelationID: result.data._id,
                        following: following,
                        followers: followers,
                        requests: requester.concat(requested)
                    });
                }
            })
    }

    handleStatusChange(action, followingRelationID, followerRelationID) {
        return (
            AxiosHelper.setFollowerStatus(
                followingRelationID,
                followerRelationID,
                action,
            )
                .then(
                    () =>
                        AxiosHelper.returnUserRelationInfo(this.props.username)
                )
                .then((result) => {
                    if (this._isMounted) {
                        this.setState({ userRelation: result.data });
                    }
                })
                .catch((err) => window.alert('Something went wrong :(')));
    }

    renderUserRow(data, request) {
        const users = [];
        if (request.exists) {
            for (const user of data) {
                const buttons = request.type === "REQUESTED" ? (<div>
                    <button
                        onClick={() => (
                            this.handleStatusChange(
                                ACCEPT_ACTION,
                                user.user_relation_id,
                                this.state.userRelationID,
                            ))}
                    >
                        {ACCEPT_REQUEST_TEXT}
                    </button>
                    <button
                        onClick={() => (
                            this.handleStatusChange(
                                DECLINE_ACTION,
                                user.user_relation_id,
                                this.state.userRelationID
                            ))}
                    >
                        {DECLINE_REQUEST_TEXT}
                    </button>
                </div>) :
                    (<button
                        onClick={() => (
                            this.handleStatusChange(
                                UNFOLLOW_ACTION,
                                this.state.userRelationID,
                                user.user_relation_id)
                        )}
                    >
                        {CANCEL_REQUEST_TEXT}
                    </button>
                    );
                users.push(
                    <div className='relationmodal-profile-row'>
                        <div className='relationmodal-profile-info-container'>
                            <img src={returnUserImageURL(user.display_photo)} />
                            <a href={returnUsernameURL(user.username)}
                            >
                                {user.username}
                            </a>
                        </div>
                        {buttons}
                    </div >
                )
            }
        }
        else {
            for (const user of data) {
                users.push(
                    <div className='relationmodal-profile-row'>
                        <div className='relationmodal-profile-info-container'>
                            <img src={returnUserImageURL(user.display_photo)} />
                            <a href={returnUsernameURL(user.username)}
                            >
                                {user.username}
                            </a>
                        </div>
                        <button
                            onClick={() => (
                                this.handleStatusChange(
                                    UNFOLLOW_ACTION,
                                    this.state.userRelationID,
                                    user.user_relation_id)
                            )}
                        >
                            {FOLLOWING_BUTTON_TEXT}
                        </button>
                    </div>
                )
            }
        }

        return users;
    }

    handleRenderRelation(renderFunction, data, isRequest) {
        if (data) {
            return renderFunction(data, isRequest);
        }
        else {
            return null;
        }
    }

    render() {
        return (
            <div id='relationmodal-window'>
                <div id='relationmodal-hero-container'>
                    <div className='relationmodal-column'>
                        <h2>Requests</h2>
                        {this.state.requests}
                    </div>
                    <div className='relationmodal-column'>
                        <h2>Followers</h2>
                        {this.state.followers}
                    </div>
                    <div className='relationmodal-column'>
                        <h2>Following</h2>
                        {this.state.following}
                    </div>
                </div>
            </div>
        );
    }
}

export default RelationModal;