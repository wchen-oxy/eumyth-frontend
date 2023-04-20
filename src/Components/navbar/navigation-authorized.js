import React from 'react';
import { Link } from 'react-router-dom';
import withRouter from 'utils/withRouter';
import ModalController from './sub-components/modal-controller';
import OptionalLinks from './sub-components/optional-links';
import OptionsMenu from './sub-components/options-menu';
import { withFirebase } from 'store/firebase';
import { returnUserImageURL } from 'utils/url';
import { NEW_ENTRY_MODAL_STATE, PEOPLE_SEARCH_STATE, RELATION_MODAL_STATE, WORKS_STATE } from 'utils/constants/flags';

class NavigationAuthorized extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showMenu: false,
            isUserStillLoading: true,
            isExistingUser: false,
            isPostModalShowing: false,
            isRequestModalShowing: false,
        };

        this.showMenu = this.showMenu.bind(this);
        this.closeMenu = this.closeMenu.bind(this);
        this.clearModal = this.clearModal.bind(this);
        this.setModal = this.setModal.bind(this);
        this.setBasicInfo = this.setBasicInfo.bind(this);
        this.displayOptionalsDecider = this.displayOptionalsDecider.bind(this);
        this.linkDecider = this.linkDecider.bind(this);

    }
    componentDidMount() {
        this.props.firebase.checkIsExistingUser()
            .then((result) => {
                const rawDisplayPhoto = this.props.authUser.tinyCroppedDisplayPhotoKey;
                const displayPhoto = returnUserImageURL(rawDisplayPhoto);
                this.setBasicInfo(
                    !!result,
                    false,
                    displayPhoto
                )
            });
    }

    showMenu(event) {
        event.preventDefault();
        this.setState({ showMenu: true }, () => {
            document.addEventListener('click', this.closeMenu);
        });
    }

    closeMenu() {
        this.setState({ showMenu: false }, () => {
            document.removeEventListener('click', this.closeMenu);
        });
    }
    setBasicInfo(isExistingUser, isUserStillLoading, tinyDisplayPhoto) {
        this.setState({
            isExistingUser,
            isUserStillLoading,
            tinyDisplayPhoto
        })
    }
    setModal(postType) {
        if (postType === NEW_ENTRY_MODAL_STATE) {
            console.log("hit");
            this.setState({ isPostModalShowing: true })
        }
        if (this.props.modalState
            && postType === this.props.modalState) {
            this.clearModal();
        }
        else {
            this.clearModal();
            this.props.openMasterModal(postType);
        }
    }

    clearModal() {
        if (this.state.isPostModalShowing) this.setState({ isPostModalShowing: false })
        this.props.closeMasterModal();
    }

    displayOptionalsDecider(component) {
        const shouldShowLinks =
            this.state.isUserStillLoading
            || !this.state.isUserStillLoading
            && this.state.isExistingUser;
        return (shouldShowLinks && component);
    }

    linkDecider() {
        if (window.location.pathname !== '/') {
            this.props.navigate('')
        }
        else if (window.location.pathname.toString() === '/') {
            window.location.reload()
        }
        else {
            throw new Error('Navbar inputted url doesnt work for some reason');
        }
    }

    render() {
        return (
            <>
                <nav>
                    <div id='navbar-left'>
                        <Link
                            to={''}
                            className='navbar-link'
                            onClick={() => this.linkDecider()}
                        >
                            <div id='navbar-logo'>
                                <h3>Third Space</h3>
                            </div>
                        </Link>
                        {this.displayOptionalsDecider(
                            <OptionalLinks
                                username={this.props.authUser.username}
                                linkType={NEW_ENTRY_MODAL_STATE}
                                setModal={this.setModal}
                            />)}
                        {/* {this.displayOptionalsDecider(
                            <OptionalLinks
                                username={this.props.authUser.username}
                                linkType={PEOPLE_SEARCH_STATE}
                                setModal={this.setModal}
                            />)}
                        {this.displayOptionalsDecider(
                            <OptionalLinks
                                linkType={WORKS_STATE}
                                setModal={this.setModal}
                            />)} */}
                    </div>
                    <div id='navbar-right'>
                        {this.displayOptionalsDecider(
                            <OptionalLinks
                                username={this.props.authUser.username}
                                linkType={RELATION_MODAL_STATE}
                                tinyDisplayPhoto={this.state.tinyDisplayPhoto}
                                setModal={this.setModal}
                            />)
                        }
                        <div id='optionsmenu-pre-click'>
                            <button className="btn-navbar" onClick={this.showMenu}>
                                <h4>•••</h4>
                            </button>
                        </div>
                        <OptionsMenu
                            showMenu={this.state.showMenu}
                            shouldHideFriendsTab={
                                !this.state.isUserStillLoading && !this.state.isExistingUser
                            }
                            closeModal={this.clearModal}
                        />
                    </div>
                </nav>
                {
                    this.props.modalState &&
                    this.props.returnModalStructure(
                        <ModalController
                            authUser={this.props.authUser}
                            modalState={this.props.modalState}
                            closeModal={this.clearModal}
                        />,
                        (() => {
                            if (this.state.isPostModalShowing) {
                                if (!window.confirm("Are you sure you want to discard your draft?"))
                                    return;
                            }
                            this.clearModal();
                        }))
                }
            </>
        );
    }
}

export default withRouter(withFirebase(NavigationAuthorized));

