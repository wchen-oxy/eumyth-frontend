import React from 'react';
import OptionsMenu from "./sub-components/options-menu";
import { withFirebase } from '../../Firebase';
import { Link, withRouter } from 'react-router-dom';
import { NEW_ENTRY_MODAL_STATE, RELATION_MODAL_STATE } from "../constants/flags";
import { returnUserImageURL, TEMP_PROFILE_PHOTO_URL } from "../constants/urls";
import AxiosHelper from '../../Axios/axios';
import ModalController from './sub-components/modal-controller';
import OptionalLinks from './sub-components/optional-links';
import './navigation-authorized.scss';

class NavigationAuthorized extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: this.props.firebase.returnUsername(),
            tinyDisplayPhoto: null,
            previousLongDraft: null,
            existingUserLoading: true,
            isExistingUser: false,
            isPostModalShowing: false,
            isRequestModalShowing: false,
        };

        this.clearModal = this.clearModal.bind(this);
        this.setModal = this.setModal.bind(this);
        this.displayOptionalsDecider = this.displayOptionalsDecider.bind(this);
        this.linkDecider = this.linkDecider.bind(this);

    }
    componentDidMount() {
        let isUserStillLoading = true;
        let isExistingUser = false;
        this.props.firebase.checkIsExistingUser().then(
            (result) => {
                isUserStillLoading = false;
                if (result) {
                    isExistingUser = true;
                }
                return AxiosHelper.returnTinyDisplayPhoto(this.state.username);
            }
        )
            .then((result) => {
                this.setState({
                    isExistingUser: isExistingUser,
                    existingUserLoading: isUserStillLoading,
                    tinyDisplayPhoto: result.data ? returnUserImageURL(result.data) : TEMP_PROFILE_PHOTO_URL
                });
            })
            ;
    }

    setModal(postType) {
        this.clearModal();
        this.props.openMasterModal(postType);
    }

    clearModal() {
        this.props.closeMasterModal();
    }

    displayOptionalsDecider(component) {
        const shouldShowLinks =
            this.state.existingUserLoading
            || !this.state.existingUserLoading && this.state.isExistingUser;
        return (shouldShowLinks && component);
    }


    linkDecider() {
        if (window.location.pathname !== "/") {
            this.props.history.push("")
        }
        else if (window.location.pathname.toString() === "/") {
            window.location.reload()
        }
        else {
            throw new Error("Navbar link went wrong for some reason");
        }
    }

    render() {

        return (
            <>
                <nav>
                    <div id="navbar-left-container">
                        <Link
                            className="navbar-navigation-link"
                            onClick={() => this.linkDecider()}
                        >
                            <div id="navbar-logo-container">
                                <h3>Everfire</h3>
                            </div>
                        </Link>
                        {this.displayOptionalsDecider(
                            <OptionalLinks
                                username={this.state.username}
                                linkType={NEW_ENTRY_MODAL_STATE}
                                setModal={this.setModal}
                            />)}
                    </div>
                    <div id="navbar-right-container">
                        {this.displayOptionalsDecider(
                            <OptionalLinks
                                username={this.state.username}
                                linkType={RELATION_MODAL_STATE}
                                tinyDisplayPhoto={this.state.tinyDisplayPhoto}
                                setModal={this.setModal}
                            />)}
                        <OptionsMenu shouldHideFriendsTab={!this.state.existingUserLoading
                            && !this.state.isExistingUser} />
                    </div>
                </nav>
                {
                    this.props.modalState &&
                    this.props.returnModalStructure(
                        <ModalController
                            modalState={this.props.modalState}
                            username={this.state.username}
                            closeModal={this.clearModal}
                        />,
                        this.clearModal)
                }
            </>
        );
    }
}

export default withRouter(withFirebase(NavigationAuthorized));

