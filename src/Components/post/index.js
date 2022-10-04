import React from 'react';
import { default as ShortPostDraft } from './draft/short-post';
import { withFirebase } from 'store/firebase';
import ShortPostViewer from './viewer/short-post';
import { appendDefaultPostFields, appendImageFields } from './draft/helpers';


class PostController extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      window: 1,
      date: this.props.eventData ?
        this.props.eventData.date :
        new Date()
          .toISOString()
          .substr(0, 10)
      ,
      difficulty: this.props.eventData ?
        this.props.eventData.difficulty : 0,
      isPaginated: this.props.eventData ?
        this.props.eventData.is_paginated : false,
      minDuration: this.props.eventData ?
        this.props.eventData.min_duration : null,
      previewTitle: this.props.eventData ?
        this.props.eventData.title : '',
      postPrivacyType: this.props.eventData ?
        this.props.eventData.post_privacy_type : this.props.authUser.preferredPostType,

      //editors
      //initial
      //shortpost meta
      labels: this.props.eventData ?
        this.props.eventData.labels : null,
      //reviewpost
      selectedPursuit: this.props.eventData ? this.props.eventData.pursuit_category : null,
      pursuit: this.props.eventData ? this.props.eventData.pursuit_category : null,
      // loading: false, //maybe
      // error: false, //maybe
      threadToggleState: false,
      titlePrivacy: false,
      threadTitle: '',
      isCompleteProject: false,
      selectedDraft: null

    };

    this.setLabels = this.setLabels.bind(this);
    this.setDraft = this.setDraft.bind(this);
    this.setSelectedPursuit = this.setSelectedPursuit.bind(this);
    this.setThreadTitle = this.setThreadTitle.bind(this);

    this.setMinDuration = this.setMinDuration.bind(this);
    this.setDate = this.setDate.bind(this);
    this.setDifficulty = this.setDifficulty.bind(this);
    this.setPostPrivacyType = this.setPostPrivacyType.bind(this);

    this.setThreadToggleState = this.setThreadToggleState.bind(this);
    this.setTitlePrivacy = this.setTitlePrivacy.bind(this);
    this.setIsCompleteProject = this.setIsCompleteProject.bind(this);
    this.setPreviewTitle = this.setPreviewTitle.bind(this);

    this.setDifficulty = this.setDifficulty.bind(this);
    this.setPostStage = this.setPostStage.bind(this);
    this.handleIndexChange = this.handleIndexChange.bind(this);
    this.setIsPaginated = this.setIsPaginated.bind(this);
    this.handleFormAppend = this.handleFormAppend.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleIndexChange(imageIndex) {
    this.setState({ imageIndex });
  }

  setPreviewTitle(previewTitle) {
    this.setState({ previewTitle })
  }


  setPostStage(value) {
    if (this.props.isViewer
      && !this.props.eventData?.cover_photo_key
      && value === 2) {
      this.retrieveThumbnail();
    }
    console.log(value);
    this.setState({ window: parseInt(value) });

  }

  setDifficulty(difficulty) {
    this.setState({ difficulty })
  }

  setLabels(labels) {
    this.setState({ labels: labels });
  }

  setDraft(selectedDraft) {
    this.setState({ selectedDraft })
  }

  setSelectedPursuit(selectedPursuit) {
    this.setState({ selectedPursuit })
  }

  setThreadTitle(threadTitle) {
    this.setState({ threadTitle })
  }

  setMinDuration(minDuration) {
    this.setState({ minDuration })
  }

  setDate(date) {
    this.setState({ date })
  }

  setPostPrivacyType(postPrivacyType) {
    this.setState({ postPrivacyType })
  }

  setThreadToggleState(threadToggleState) {
    this.setState({ threadToggleState })
  }

  setTitlePrivacy(titlePrivacy) {
    this.setState({ titlePrivacy })
  }

  setIsCompleteProject(isCompleteProject) {
    this.setState({ isCompleteProject })
  }


  setIsPaginated(isPaginated) {
    this.setState({ isPaginated });
  }

  handleFormAppend(formData, required, images, functions) {
    const defaults = {
      ...required,
      postPrivacyType: this.state.postPrivacyType,
      difficulty: this.state.difficulty,
      labels: this.state.labels,
      date: this.state.date,
      minDuration: this.state.minDuration,
      isPaginated: this.state.isPaginated,
      previewTitle: this.state.previewTitle,
      selectedPursuit: this.state.selectedPursuit,
      username: this.props.authUser.username,
      userPreviewID: this.props.authUser.userPreviewID,
      indexProfileID: this.props.authUser.indexProfileID,
      smallCroppedDisplayPhotoKey: this.props.authUser.smallCroppedDisplayPhotoKey,
      profileID: this.props.authUser.profileID,
    }

    const completeOptionals = {
      ...(this.props.isViewer && {
        isUpdateToPost: true,
        isPostOnlyView: true,
        coverPhotoKey: this.props.eventData?.cover_photo_key ?? null,
        projectPreviewID: this.props.eventData.project_preview_id,
        selectedDraft: this.state.selectedDraft,
        postID: this.props.eventData._id,
      }),
      threadToggleState: this.state.threadToggleState,
      isCompleteProject: this.state.isCompleteProject,
      titlePrivacy: this.state.titlePrivacy,
      threadTitle: this.state.threadTitle,
    }
    appendDefaultPostFields(formData, { ...defaults, ...completeOptionals });
    appendImageFields(formData, images, functions);
  }

  render() {
    const shared = {
      window: this.state.window,
      minDuration: this.state.minDuration,
      date: this.state.date,
      eventData: this.props.eventData,
      previewTitle: this.state.previewTitle,
      postPrivacyType: this.state.postPrivacyType,
      difficulty: this.state.difficulty,
      pursuit: this.state.pursuit,
      isPaginated: this.state.isPaginated,
      labels: this.state.labels,
      titlePrivacy: this.state.titlePrivacy,
      threadTitle: this.state.threadTitle,
      threadToggleState: this.state.threadToggleState,
      isCompleteProject: this.state.isCompleteProject,
      selectedDraft: this.state.selectedDraft,
      selectedPursuit: this.state.selectedPursuit,

      setDifficulty: this.setDifficulty,
      setDraft: this.setDraft,
      setPostStage: this.setPostStage,
      setMinDuration: this.setMinDuration,
      setIsCompleteProject: this.setIsCompleteProject,
      setThreadToggleState: this.setThreadToggleState,
      setThreadTitle: this.setThreadTitle,
      setLabels: this.setLabels,
      setTitlePrivacy: this.setTitlePrivacy,
      setIsPaginated: this.setIsPaginated,
      setPostPrivacyType: this.setPostPrivacyType,
      setSelectedPursuit: this.setSelectedPursuit,
      setPreviewTitle: this.setPreviewTitle,
      handleFormAppend: this.handleFormAppend,
    }


    if (this.props.eventData === null) { return null };
    if (this.props.isViewer) {
      return (
        <ShortPostViewer
          authUser={this.props.authUser}
          closeModal={this.props.closeModal}
          {...shared}
          {...this.props.viewerObject}
        />);
    }
    else
      return (
        <ShortPostDraft
          authUser={this.props.authUser}
          closeModal={this.props.closeModal}
          {...shared}

        />
      );
  }
}

export default withFirebase(PostController);