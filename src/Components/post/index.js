import React from 'react';
import imageCompression from 'browser-image-compression';
import { default as ShortPostDraft } from './draft/short-post';
import { withFirebase } from 'store/firebase';
import ShortPostViewer from './viewer/short-post';
import { appendPrimaryPostFields, appendImageFields, handleNewSubmit, handleUpdateSubmit } from './draft/helpers';
import AxiosHelper from 'utils/axios';
import fileDisplayContainer from './editor/sub-components/file-display-container';

const labelFormatter = (value) => { return { label: value, value: value } };
class PostController extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    const data = this.props.viewerObject?.eventData ?? null;
    console.log(this.props.viewerObject);
    this.state = {
      window: 1,
      imageIndex: 0,
      date: data?.date ?
        new Date(data.date)
          .toISOString()
          .substring(0, 10) :
        new Date()
          .toISOString()
          .substr(0, 10)
      ,
      difficulty: !!data ?
        data.difficulty : 0,
      isPaginated: !!data ?
        data.is_paginated : false,
      minDuration: !!data ?
        data.min_duration : null,
      previewTitle: !!data ?
        data.title : '',
      postPrivacyType: !!data ?
        data.post_privacy_type : this.props.authUser.preferredPostType,

      //editors
      tempText: '',
      //initial
      //shortpost meta
      labels: data ?
        data.labels.map(labelFormatter) : null,
      //review stage
      selectedPursuit: data ? data.pursuit_category : null,
      // pursuit: data ? data.pursuit_category : null,
      // loading: false, //maybe
      // error: false, //maybe
      isNewSeriesToggled: false,
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
    this.retrieveThumbnail = this.retrieveThumbnail.bind(this);

    this.handleTextChange = this.handleTextChange.bind(this);
    this.handlePaginatedChange = this.handlePaginatedChange.bind(this);

  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleTextChange(text, isTitle) {
    if (isTitle) {
      this.setPreviewTitle(text);
    }
    else {
      let tempText = this.state.tempText;;
      if (this.state.isPaginated) {
        tempText[this.state.imageIndex] = text; //fixme imageIndex
      }
      else {
        tempText = text;
      }
      this.setState(({ tempText }));
    }

  }

  handlePaginatedChange() {
    if (this.props.isPaginated === false) {
      const imageCount = this.props.isViewer ?
        this.props.eventData.image_data.length :
        this.state.validFiles.length;
      let postArray = [];
      for (let i = 0; i < imageCount; i++) {
        if (i === this.state.imageIndex) { //for the editing of an image on a non first page
          postArray.push(this.state.tempText);
        }
        else {
          postArray.push([]);
        }
      }
      this.setState({ tempText: postArray }, () => this.setIsPaginated(true));
    }
    else {
      if (window.confirm(`Switching back will remove all your captions except 
                          for the first one. Keep going?`
      )) {
        const tempText = this.state.tempText[0];
        this.setState({ tempText }, () => this.setIsPaginated(false));
      }
    }
  }

  handleIndexChange(imageIndex) {
    this.setState({ imageIndex });
  }

  setPreviewTitle(previewTitle) {
    this.setState({ previewTitle })
  }


  retrieveThumbnail() {
    const data = this.props.viewerObject.eventData;
    if (data.image_data?.length > 0) {
      return AxiosHelper.returnImage(data.image_data[0])
        .then((result) => {
          return fetch(result.data.image)
        })
        .then((result) => result.blob())
        .then((result) => {
          const file = new File([result], 'Thumbnail', {
            type: result.type
          });
          return imageCompression(file, {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 250
          })
        })
        .then((result) => this.setState({ coverPhoto: result }));
    }
  }

  setPostStage(value) {
    if (this.props.isViewer
      && !this.props.viewerObject.eventData?.cover_photo_key
      && value === 2) {
      this.retrieveThumbnail();
    }
    this.setState({ window: parseInt(value) });

  }

  setDifficulty(difficulty) {
    this.setState({ difficulty })
  }

  setLabels(labels) {
    console.log(labels);
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

  setThreadToggleState(isNewSeriesToggled) {
    this.setState({ isNewSeriesToggled })
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

  handleFormAppend(formData, images, functions) {
    //required
    //selectedDraft
    //textData

    //optional
    //useImageForThumbnail
    //coverPhoto
    //compressedPhotos

    //viewerObject
    // key: this.state.selectedContent._id,
    // largeViewMode: true,
    // textData: formattedTextData,
    // isPostOnlyView: this.state.isContentOnlyView,
    // pursuitNames: this.state.pursuitNames,
    // eventData: this.state.selectedContent,
    // projectPreviewMap: {}

    const defaults = {
      tempText: this.state.tempText,
      selectedDraft: this.state.selectedDraft,
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
      profileID: this.props.authUser.profileID,
      smallCroppedDisplayPhotoKey: this.props.authUser.smallCroppedDisplayPhotoKey,
    }

    const completeOptionals = {
      ...(this.props.isViewer && {
        isUpdateToPost: true,
        coverPhotoKey: this.props.viewerObject.eventData?.cover_photo_key ?? null,
        projectPreviewID: this.props.viewerObject.eventData.project_preview_id,
        postID: this.props.viewerObject.eventData._id,
      }),
      isCompleteProject: this.state.isCompleteProject,
      titlePrivacy: this.state.titlePrivacy,
      threadTitle: this.state.threadTitle,
    }
    appendPrimaryPostFields(formData, { ...defaults, ...completeOptionals });
    appendImageFields(formData, images, functions);
    const params = [
      formData,
      {
        ...completeOptionals,
        selectedDraft: this.state.selectedDraft,
        textData: this.state.tempText
      },
      functions,
      this.props.viewerObject?.isPostOnlyView ?? false,
      this.state.isNewSeriesToggled
    ]
    if (this.props.isViewer) {
      if (!images.useImageForThumbnail && images.coverPhotoKey) {
        return AxiosHelper
          .deletePhotoByKey(images.coverPhotoKey)
          .then(() =>
            handleUpdateSubmit(...params));
      }
      return handleUpdateSubmit(...params);
    }
    else {

      return handleNewSubmit(
        formData,
        { ...defaults, ...completeOptionals, ...images },
        functions,
        this.props.viewerObject?.isPostOnlyView ?? false,
        this.state.isNewSeriesToggled
      );
    }
  }

  render() {
    const miniAuthObject = {
      pastLabels: this.props.authUser.labels,
      userPreviewID: this.props.authUser.userPreviewID,
      profileID: this.props.authUser.profileID,
      indexProfileID: this.props.authUser.indexProfileID,
      username: this.props.authUser.username,
      drafts: this.props.authUser.drafts,
      pursuitNames: this.props.authUser.pursuits
    }

    const shared = {
      window: this.state.window,
      imageIndex: this.state.imageIndex,
      isPaginated: this.state.isPaginated,
      tempText: this.state.tempText,

      setDraft: this.setDraft,
      setPostStage: this.setPostStage,
      setIsPaginated: this.setIsPaginated,
      setPreviewTitle: this.setPreviewTitle,
      onIndexChange: this.handleIndexChange,
      onTextChange: this.handleTextChange
    }

    const initialSharedObject = {
      previewTitle: this.state.previewTitle,
    }

    const initialDraftObject = {
      ...initialSharedObject,
    }

    const initialViewerObject = {
      ...initialSharedObject,
      date: this.state.date,
      labels: this.state.labels,
      minDuration: this.state.minDuration,
      difficulty: this.state.difficulty,
      pursuit: this.state.selectedPursuit
    }

    const metaObject = {
      ...initialSharedObject,
      date: this.state.date,
      difficulty: this.state.difficulty,
      pastLabels: this.props.authUser.labels,
      selectedLabels: this.state.labels,
      minDuration: this.state.minDuration,
      postPrivacyType: this.state.postPrivacyType,
      threadTitle: this.state.threadTitle,
      titlePrivacy: this.state.titlePrivacy,
    }

    const metaFunctions = {
      setDate: this.setDate,
      setDifficulty: this.setDifficulty,
      setLabels: this.setLabels,
      setMinDuration: this.setMinDuration,
      setPostPrivacyType: this.setPostPrivacyType,
    }

    const threadObject = {
      date: this.state.date,
      drafts: this.props.authUser.drafts,
      selectedDraft: this.state.selectedDraft,
      selectedPursuit: this.state.selectedPursuit,
      isCompleteProject: this.state.isCompleteProject,
      pursuitNames: this.props.authUser.pursuits,
      threadTitle: this.state.threadTitle,
      titlePrivacy: this.state.titlePrivacy,
      threadToggleState: this.state.isNewSeriesToggled,
    }

    const threadFunction = {
      setThreadTitle: this.setThreadTitle,
      setTitlePrivacy: this.setTitlePrivacy,
      setSelectedPursuit: this.setSelectedPursuit,
      setIsCompleteProject: this.setIsCompleteProject,
      handleFormAppend: this.handleFormAppend,
      setThreadToggleState: this.setThreadToggleState,
    }

    if (this.props.isViewer) {
      return (
        <ShortPostViewer
          {...miniAuthObject}
          {...this.props.viewerObject}
          {...shared}
          initialViewerObject={initialViewerObject}
          metaObject={metaObject}
          metaFunctions={metaFunctions}
          threadObject={threadObject}
          threadFunction={threadFunction}
          closeModal={this.props.closeModal}

        />);
    }

    else
      return (
        <ShortPostDraft
          {...miniAuthObject}
          {...shared}
          initialDraftObject={initialDraftObject}
          metaObject={metaObject}
          metaFunctions={metaFunctions}
          threadObject={threadObject}
          threadFunction={threadFunction}
          closeModal={this.props.closeModal}
        />
      );
  }
}

export default withFirebase(PostController);