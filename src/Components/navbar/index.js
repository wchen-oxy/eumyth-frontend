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

const NavBar = () => (
  <AuthUserContext.Consumer>
    {authUser =>
      authUser &&
        authUser.emailVerified ? <NavigationAuthBase /> : <NavigationNonAuth />
    }
  </AuthUserContext.Consumer>
);

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
    this.modalRef = React.createRef();
    this.renderModal = this.renderModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.openModal = this.openModal.bind(this);

  }
  componentDidMount() {
    let isUserStillLoading = true;
    let isExistingUser = false;
    this.props.firebase.checkIsExistingUser().then(
      (result) => {
        isUserStillLoading = false;
        if (result) {
          console.log("isExisting");
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

  openModal(postType) {
    document.body.style.overflow = "hidden";
    if (this.modalRef.current) {
      this.modalRef.current.style.display = "block";
    }
    if (postType === POST) {
      this.setState({ isPostModalShowing: true });

    }
    else if (postType === REQUEST_ACTION) {
      this.setState({ isRequestModalShowing: true });
    }
  }

  closeModal() {
    this.modalRef.current.style.display = "none";
    document.body.style.overflow = "visible";
    this.setState({
      isRequestModalShowing: false,
      isPostModalShowing: false
    });

  }

  renderModal() {
    let modal = null;
    if (this.state.isPostModalShowing) {
      modal = (
        <>
          <div
            className="overlay"
            onClick={(() => this.closeModal())}>
          </div>
          <PostDraftController
            username={this.state.username}
            closeModal={this.closeModal}
          />
        </>
      );
    }
    else if (this.state.isRequestModalShowing) {
      modal = (
        <>
          <div className="overlay" onClick={(() => this.closeModal())}></div>
          <RelationModal
            username={this.state.username}
            closeModal={this.closeModal} />
        </>
      )
    }
    return (
      <div className="modal" ref={this.modalRef}>
        <div className="overlay"></div>
        {modal}
      </div>
    );
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
                <button onClick={() => this.openModal(POST)}>
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
                    <button onClick={() => this.openModal(REQUEST_ACTION)}>
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