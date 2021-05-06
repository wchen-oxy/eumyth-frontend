import React from 'react';
import AxiosHelper from '../../../Axios/axios';
import { returnUserImageURL, returnUsernameURL } from "../../constants/urls";
import {
    UNFOLLOW_ACTION,
    REQUEST_ACTION,
    ACCEPT_ACTION,
    DECLINE_ACTION
} from "../../constants/flags";
import "./relation-modal.scss";

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
                    const following = this.handleRenderRelation(
                        this.renderUserRow,
                        result.data.following,
                        false);
                    const followers = this.handleRenderRelation(
                        this.renderUserRow,
                        result.data.followers,
                        false);
                    const requested = this.handleRenderRelation(
                        this.renderUserRow,
                        result.data.requested,
                        true);
                    this.setState({
                        userRelationID: result.data._id,
                        following: following,
                        followers: followers,
                        requested: requested
                    });
                }
            })
    }

    handleStatusChange(action, username) {
        return (
            AxiosHelper.changeRelationStatus(
                action,
                username,
                this.props.username,
                this.state.userRelation._id)
                .then(
                    () =>
                        AxiosHelper.returnUserRelationInfo(this.props.username)
                )
                .then((result) => {
                    if (this._isMounted) {
                        this.setState({ userRelation: result.data });
                    }
                })
                .catch((err) => window.alert("Something went wrong :(")))
            ;
    }


    renderUserRow(data, isRequest) {
        let users = [];
        for (const user of data) {
            users.push(
                <div className="relationmodal-profile-row">
                    <div className="relationmodal-profile-info-container">
                        <img src={returnUserImageURL(user.display_photo)} />
                        <a href={returnUsernameURL(user.username)}
                        >
                            {user.username}
                        </a>
                    </div>
                    {!isRequest ? <button
                        onClick={() => (
                            this.handleStatusChange(
                                UNFOLLOW_ACTION,
                                user.username)
                        )}
                    >
                        Following
                    </button> : null}
                    {isRequest ?
                        <div>
                            <button
                                onClick={() => (
                                    this.handleStatusChange(
                                        ACCEPT_ACTION,
                                        user.username))}
                            >
                                Accept Request
                    </button>
                            <button
                                onClick={() => (
                                    this.handleStatusChange(
                                        DECLINE_ACTION,
                                        user.username))}
                            >
                                Decline Request
                    </button>
                        </div>
                        :
                        null
                    }

                </div>
            )
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
            <div id="relationmodal-window">
                <span
                    className="close"
                    onClick={(() => this.props.closeModal(REQUEST_ACTION))}
                >
                    X
                </span>
                <div id="relationmodal-hero-container">
                    <div className="relationmodal-column">
                        <h2>Requests</h2>
                        {this.state.requested}
                    </div>
                    <div className="relationmodal-column">
                        <h2>Followers</h2>
                        {this.state.followers}
                    </div>
                    <div className="relationmodal-column">
                        <h2>Following</h2>
                        {this.state.following}
                    </div>
                </div>
            </div>
        );
    }
}

export default RelationModal;