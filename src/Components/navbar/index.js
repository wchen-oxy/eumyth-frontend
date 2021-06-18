import React from 'react';
import PostDraftController from '../post/draft/index';
import RelationModal from "./sub-components/relation-modal";
import OptionsMenu from "./sub-components/options-menu";
import { AuthUserContext } from '../../Components/session/'
import { withFirebase } from '../../Firebase';
import { Link } from 'react-router-dom';
import { POST, REQUEST_ACTION } from "../constants/flags";
import { returnUserImageURL, returnUsernameURL, TEMP_PROFILE_PHOTO_URL } from "../constants/urls";
import AxiosHelper from '../../Axios/axios';
import './index.scss';

const NavBar = (props) => {
  return (
    <AuthUserContext.Consumer>
      {authUser =>
        authUser && authUser.emailVerified ?
          <NavigationAuthBase
            shouldFloatNavbar={props.shouldFloatNavbar}
            onFloatNavbarChange={props.onFloatNavbarChange}
            masterModal={props.masterModal}
            openMasterModal={props.openMasterModal}
            closeMasterModal={props.closeMasterModal}
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
      isRequestModalShowing: false,
    };

    this.modalRef = React.createRef();
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
    if (postType === POST) {
      this.props.openMasterModal();
    }
    else if (postType === REQUEST_ACTION) {
      this.setState({ isRequestModalShowing: true }, this.props.openMasterModal());
    }
  }

  clearModal() {
    this.setState({
      isRequestModalShowing: false,
    }, this.props.closeMasterModal());
  }

  renderModal() {
    let modal = null;
    if (this.state.isRequestModalShowing) {
      modal = (

        <RelationModal
          username={this.state.username}
          closeModal={this.clearModal} />
      )
    }
    else {
      modal = (
        <PostDraftController
          username={this.state.username}
          closeModal={this.clearModal}
        />

      );
    }
    return this.props.masterModal(modal);

    // (

    //   <div className="modal" ref={this.modalRef}>
    //       <div
    //         className="overlay"
    //         onClick={(() => this.closeMasterModal())}>
    //       </div>
    //     {modal}
    //   </div>
    // );
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
              to={"/"}
              className="navbar-navigation-link">
              <div id="navbar-logo-container">
                <h3>Everfire</h3>
              </div>
            </Link>
            {shouldHideFeatures ? (<></>) :
              <div className="navbar-main-action-buttons-container" >
                <button onClick={() => this.setModal(POST)}>
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
                  <a
                    href={returnUsernameURL(this.state.username)}

                  >
                    <div
                      className="navbar-main-action-buttons-container"
                    >
                      <div id="navbar-display-photo-container">
                        <img src={this.state.tinyDisplayPhoto} />
                      </div>
                      <p>{this.state.username}</p>
                    </div>
                  </a>
                  <div className="navbar-main-action-buttons-container">
                    <button onClick={() => this.setModal(REQUEST_ACTION)}>
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
        {this.state.existingUserLoading ? <></> : this.renderModal()}
      </>
    );
  }
}

const NavigationAuthBase = withFirebase(NavigationAuth);

export default NavBar;