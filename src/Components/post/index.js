import React from 'react';
import imageCompression from 'browser-image-compression';
import { default as ShortPostDraft } from './draft/short-post';
import { withFirebase } from 'store/firebase';
import ShortPostViewer from './viewer/short-post';
import {
  appendPrimaryPostFields,
  appendSecondarySeriesFields,
  handleProjectCreation,
  appendOptionalImageFields,
  appendTertiaryUpdateFields,
  decideNewOrUpdate,
  handlePostOwnerUpdate,
  handleCreatedProjectAppend
} from './draft/helpers';
import AxiosHelper from 'utils/axios';
import { checkPostFunctionsExist } from 'utils/validator';

//fixme  Cast to String failed for value "[ 'Full Test', 'New Series For Test' ]" at path "title"
//fixme new project postIDList is missing 
//fixme new post, selectedDraftID is missing

const _selectExistingDraft = (drafts, eventData) => {
  if (drafts && eventData) {
    return drafts
      .find(item => item.project_preview_id === eventData.project_preview_id);
  }
  else {
    return null
  }

}

const labelFormatter = (value) => { return { label: value, value: value } };
class PostController extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    const data = this.props.viewerObject?.eventData ?? null;
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
      compressedPhotos: [],
      coverPhoto: null,
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
      selectedDraft: this.props.authUser ? _selectExistingDraft(this.props.authUser.drafts, data) : null

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
    this.setPhotoData = this.setPhotoData.bind(this);

    this.setDifficulty = this.setDifficulty.bind(this);
    this.setPostStage = this.setPostStage.bind(this);
    this.handleIndexChange = this.handleIndexChange.bind(this);
    this.setIsPaginated = this.setIsPaginated.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.retrieveThumbnail = this.retrieveThumbnail.bind(this);

    this.handleTextChange = this.handleTextChange.bind(this);
    this.handlePaginatedChange = this.handlePaginatedChange.bind(this);

  }

  componentDidMount() {
    this._isMounted = true;
    if (this.props.isViewer) checkPostFunctionsExist(
      this.props.viewerFunctions,
      this.props.viewerObject?.isPostOnlyView
    );
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  setPhotoData(coverPhoto, compressedPhotos) {
    this.setState({
      coverPhoto,
      compressedPhotos
    })
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
    const window = parseInt(value);
    const isReEdit = window === 2 && this.props.isViewer;
    const tempText = isReEdit ? this.props.viewerObject.textData : '';
    if (this.props.isViewer
      && !this.props.viewerObject.eventData?.cover_photo_key
      && value === 2) {
      this.retrieveThumbnail();
      this.setState({
        window,
        tempText
      });
    }
    else {
      this.setState({ window })
    }

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

  handleSubmit(functions) {
    const isUpdate = this.props.isViewer;
    let promiseChain = Promise.resolve();
    let formData = new FormData();
    const postText = {
      textData: this.state.tempText,
      previewTitle: this.state.previewTitle,
    }
    const postMeta = {
      postPrivacyType: this.state.postPrivacyType,
      difficulty: this.state.difficulty,
      labels: this.state.labels,
      date: this.state.date,
      minDuration: this.state.minDuration,
      isPaginated: this.state.isPaginated,
    }

    const userMeta = {
      username: this.props.authUser.username,
      userPreviewID: this.props.authUser.userPreviewID,
      indexProfileID: this.props.authUser.indexProfileID,
      profileID: this.props.authUser.profileID,
      smallCroppedDisplayPhotoKey: this.props.authUser.smallCroppedDisplayPhotoKey,
    }

    const existingSeriesMeta = { //can be appended immediately 
      selectedDraft: this.state.selectedDraft, //old
      isCompleteProject: this.state.isCompleteProject, //old
    }

    const newSeriesMeta = { //useful only for project creation component
      threadTitle: this.state.threadTitle, //new only
      selectedPursuit: this.state.selectedPursuit, //new one
      titlePrivacy: this.state.titlePrivacy, //new
    }

    const defaults = {
      ...postText,
      ...postMeta,
      ...userMeta
    }
    //check if all of update works, otherwise is compelte 
    appendPrimaryPostFields(formData, defaults);
    appendSecondarySeriesFields(formData, existingSeriesMeta); //what  is this for?
    appendTertiaryUpdateFields(formData, this.props.viewerObject?.eventData ?? null, isUpdate);

    if (this.state.compressedPhotos.length > 0) {
      const images = {
        coverPhoto: this.state.coverPhoto,
        imageArray: this.state.compressedPhotos
      }
      appendOptionalImageFields(formData, images);
    }

    if (this.state.isNewSeriesToggled) {
      promiseChain = promiseChain
        .then(() => handleProjectCreation(userMeta, newSeriesMeta))
        .then((results) => {
          return handleCreatedProjectAppend(results, formData);
        });
    }
    if (
      isUpdate
      && this.props.viewerObject?.eventData.project_preview_id
      !== this.state.selectedDraft.project_preview_id
    ) {
      promiseChain = promiseChain
        .then((createdProjectMeta) => {
          const replacementProjectMeta = this.state.isNewSeriesToggled ?
            createdProjectMeta : this.state.selectedDraft;
          console.log(replacementProjectMeta);
          return handlePostOwnerUpdate(
            formData,
            this.props.viewerObject.eventData._id,
            {
              newProjectID: replacementProjectMeta.content_id,
              newProjectPreviewID: replacementProjectMeta.project_preview_id,
              oldProjectPreviewID: this.props.viewerObject?.eventData.project_preview_id
            }
          )
        });
    }

    promiseChain = promiseChain
      .then(
        () => decideNewOrUpdate(
          formData,
          functions,
          this.props.viewerObject?.isPostOnlyView ?? false,
          this.props.isViewer
        ))
    return promiseChain;
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
      modalState: this.props.modalState,

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
      handleSubmit: this.handleSubmit,
      setThreadToggleState: this.setThreadToggleState,
    }
    if (this.props.isViewer) {
      return (
        <ShortPostViewer
          {...miniAuthObject}
          {...this.props.viewerObject}
          {...this.props.viewerFunctions}
          {...shared}
          initialViewerObject={initialViewerObject}
          metaObject={metaObject}
          metaFunctions={metaFunctions}
          threadObject={threadObject}
          threadFunction={threadFunction}

        />);
    }

    else
      return (
        <ShortPostDraft
          {...miniAuthObject}
          {...this.props.viewerFunctions}
          {...shared}

          initialDraftObject={initialDraftObject}
          metaObject={metaObject}
          metaFunctions={metaFunctions}
          threadObject={threadObject}
          threadFunction={threadFunction}
          setPhotoData={this.setPhotoData}
          
        />
      );
  }
}

export default withFirebase(PostController);