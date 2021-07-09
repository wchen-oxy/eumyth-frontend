import React from 'react';
import PostDraftController from '../post/draft/index';
import RelationModal from "./sub-components/relation-modal";
import OptionsMenu from "./sub-components/options-menu";
import { AuthUserContext } from '../../Components/session/'
import { withFirebase } from '../../Firebase';
import { Link, withRouter } from 'react-router-dom';
import { NEW_ENTRY_MODAL_STATE, RELATION_MODAL_STATE } from "../constants/flags";
import { returnUserImageURL, returnUsernameURL, TEMP_PROFILE_PHOTO_URL } from "../constants/urls";
import AxiosHelper from '../../Axios/axios';
import './index.scss';

const NavBar = (props) => {
  return (
    <AuthUserContext.Consumer>
      {authUser =>
        authUser && authUser.emailVerified ?
          <NavigationAuthBase
            returnModalStructure={props.returnModalStructure}
            openMasterModal={props.openMasterModal}
            closeMasterModal={props.closeMasterModal}
            modalState={props.modalState}
          /> : <NavigationNonAuth />
      }
    </AuthUserContext.Consumer>
  );
}

const NavigationNonAuth = () => (
  <nav>
    <div>
      <Link to={"/"} className="navbar-navigation-link">interestHub</Link>
    </div>
  </nav>
);

class NavigationAuth extends React.Component {
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

    this.renderModal = this.renderModal.bind(this);
    this.clearModal = this.clearModal.bind(this);
    this.setModal = this.setModal.bind(this);

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

  renderModal() {
    let modal = null;
    if (this.props.modalState === RELATION_MODAL_STATE) {
      modal = (
        <RelationModal
          username={this.state.username}
          closeModal={this.clearModal} />
      )
      return this.props.returnModalStructure(modal, this.clearModal);
    }
    else if (this.props.modalState === NEW_ENTRY_MODAL_STATE) {
      modal = (
        <PostDraftController
          username={this.state.username}
          closeModal={this.clearModal}
        />
      );
      return this.props.returnModalStructure(modal, this.clearModal);
    }
    else {
      return null;
    }
  }

  render() {

    const shouldHideFeatures =
      this.state.existingUserLoading
      || !this.state.existingUserLoading && !this.state.isExistingUser;
    return (
      <>
        <nav>
          <div id="navbar-left-container">
            <Link
              onClick={() => {
                if (window.location.pathname !== "/") {
                  this.props.history.push("")
                }
                else if (window.location.pathname.toString() === "/") {

                  window.location.reload()
                }
              }}
              className="navbar-navigation-link"
            >
              <div id="navbar-logo-container">
                <h3>Everfire</h3>
              </div>
            </Link>
            {shouldHideFeatures ? (<></>) :
              <div className="navbar-main-action-buttons-container" >
                <button onClick={() => this.setModal(NEW_ENTRY_MODAL_STATE)}>
                  <h4>+ New Entry</h4>
                </button>
              </div>
            }
          </div>
          <div id="navbar-right-container">
            {shouldHideFeatures ?
              (<></>) :
              (
                <>
                   <Link
                    to={returnUsernameURL(this.state.username)}

                  >
                    <div
                      className="navbar-main-action-buttons-container"
                    >
                      <div id="navbar-display-photo-container">
                        <img src={this.state.tinyDisplayPhoto} />
                      </div>
                      <p>{this.state.username}</p>
                    </div>
                  </Link>
                  <div className="navbar-main-action-buttons-container">
                    <button onClick={() => this.setModal(RELATION_MODAL_STATE)}>
                      <h4>Friends</h4>
                    </button>
                  </div>
                </>
              )
            }
            <OptionsMenu shouldHideFriendsTab={!this.state.existingUserLoading
              && !this.state.isExistingUser} />
          </div>
        </nav>
        {this.renderModal()}
      </>
    );
  }
}

const NavigationAuthBase = withRouter(withFirebase(NavigationAuth));

export default NavBar;