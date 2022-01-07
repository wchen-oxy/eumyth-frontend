import React from 'react';
import ShortPost from './short-post';
import { withFirebase } from 'store/firebase';
import { SHORT } from 'utils/constants/flags';

class PostDraftController extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      localDraft: null,
      onlineDraft: null,
      isSavePending: false,
      updatingOnlineDraft: true,
      postType: SHORT,
      pursuitNames: null,
      pursuitTemplates: null,
      indexUserData: null,
      errorRetrievingDraft: false,
      errorSaving: false,
    };

    this.handleDisablePost = this.handleDisablePost.bind(this);
    this.handleSubmitPost = this.handleSubmitPost.bind(this);
    this.setSavePending = this.setSavePending.bind(this);
    this.handlePostTypeSet = this.handlePostTypeSet.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.onPreferredPostPrivacyChange = this.onPreferredPostPrivacyChange.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
  }
  componentWillUnmount() {
    this._isMounted = false;
  }

  setSavePending(isSavePending) {
    this.setState({ isSavePending: isSavePending });
  }

  handleModalClose() {
    if (this.state.postType === SHORT) {
      if (window.confirm('Do you want to discard this post?')) {
        this.props.closeModal();
      }
    }
  }

  onPreferredPostPrivacyChange(type) {
    this.setState({ preferredPostPrivacy: type });
  }

  handleSubmitPost(e) {
    alert('PRESSED SUBMIT');
  }
  handleDisablePost(disabled) {
    this.setState({ postDisabled: disabled });
  }

  handlePostTypeSet(postType, localDraft) {
    switch (postType) {
      case (SHORT):
        this.setState({ postType: postType });
        break;
      default:
        throw Error('No postType options matched :(');
    }
  }

  render() {
    return (
      <ShortPost
        onlineDraft
        authUser={this.props.authUser}
        closeModal={this.props.closeModal}
        setImageArray={this.setImageArray}
        handlePreferredPostPrivacyChange={this.onPreferredPostPrivacyChange}
        onPostTypeSet={this.handlePostTypeSet}
        disablePost={this.handleDisablePost}
      />
    );
  }
}

export default withFirebase(PostDraftController);