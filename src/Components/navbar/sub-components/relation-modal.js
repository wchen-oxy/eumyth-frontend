import React from 'react';
import AxiosHelper from 'utils/axios';
import { returnUserImageURL, returnUsernameURL } from 'utils/url';
import {
    UNFOLLOW_ACTION,
    ACCEPT_ACTION,
    DECLINE_ACTION,
} from 'utils/constants/flags';
import {
    ACCEPT_REQUEST_TEXT,
    DECLINE_REQUEST_TEXT,
    REMOVE_TEXT,
    CANCEL_REQUEST_TEXT,
    FOLLOWING_BUTTON_TEXT,
} from 'utils/constants/ui-text';

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
        this.handleDataSet = this.handleDataSet.bind(this);
        this.handleRelationUpdate = this.handleRelationUpdate.bind(this);
    }

    componentDidMount() {
        this._isMounted = true;
        AxiosHelper.returnUserRelationInfo(this.props.username)
            .then((result) => {
                if (this._isMounted) {
                    this.handleDataSet(result.data);
                }
            })
    }

    handleDataSet(result) {
        const following = this.handleRenderRelation(
            this.renderUserRow,
            result.following,
            { exists: true, type: 'FOLLOWING' });
        const followers = this.handleRenderRelation(
            this.renderUserRow,
            result.followers,
            { exists: true, type: 'REMOVE' });
        const requested = this.handleRenderRelation(
            this.renderUserRow,
            result.requested,
            { exists: false, type: 'REQUESTED' });
        const requester = this.handleRenderRelation(
            this.renderUserRow,
            result.requester,
            { exists: false, type: 'REQUESTER' });
        this.setState({
            userRelationID: result._id,
            following: following,
            followers: followers,
            requests: requester.concat(requested)
        });
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
                    this.handleDataSet(result.data);
                })
                .catch((err) => window.alert('Something went wrong :(')));
    }

    handleRelationUpdate() {

    }

    renderUserRow(data, relation) {
        const users = [];
        if (!relation.exists) {
            for (const user of data) {
                const buttons = relation.type === "REQUESTED" ? (
                    <div className='relationmodal-button-container'>
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
                    </div>)
                    :
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
                        {
                            relation.type === 'FOLLOWING' ?
                                <button
                                    onClick={() => (
                                        this.handleStatusChange(
                                            UNFOLLOW_ACTION,
                                            this.state.userRelationID,
                                            user.user_relation_id)
                                    )}
                                >
                                    {FOLLOWING_BUTTON_TEXT}
                                </button> :
                                <button
                                    onClick={() => (
                                        this.handleStatusChange(
                                            UNFOLLOW_ACTION,
                                            user.user_relation_id,
                                            this.state.userRelationID)
                                    )}
                                >
                                    {REMOVE_TEXT}
                                </button>
                        }
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