import React from 'react';
import imageCompression from 'browser-image-compression';
import ReviewStage from './review-stage';
import ShortPostInitial from './short-post-initial';
import MetaStage from './meta-stage';

class ShortPost extends React.Component {
  constructor(props) {
    super(props);

    // const complexDraftStates =
    //   draftStateSetter(this.props);
    this.state = {
      window: 1,
      imageIndex: 0,

      selectedFiles: [],
      validFiles: [],
      unsupportedFiles: [],
      imageArray: [],
      tinyPhotos: null,

      textData: '',
      postDisabled: true,

    };
    this.warnModalClose = this.warnModalClose.bind(this);
    this.handleIndexChange = this.handleIndexChange.bind(this);
    this.setSelectedFiles = this.setSelectedFiles.bind(this);
    this.setValidFiles = this.setValidFiles.bind(this);
    this.setUnsupportedFiles = this.setUnsupportedFiles.bind(this);
    this.setImageArray = this.setImageArray.bind(this);
    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleUnsupportedFileChange = this.handleUnsupportedFileChange.bind(this);
    this.handleSelectedFileChange = this.handleSelectedFileChange.bind(this);
    this.handleDisablePost = this.handleDisablePost.bind(this);
    this.generateValidFiles = this.generateValidFiles.bind(this);
    this.handlePaginatedChange = this.handlePaginatedChange.bind(this);
    this.handleSortEnd = this.handleSortEnd.bind(this);
    this.loadImage = this.loadImage.bind(this);
    this.transformImageProp = this.transformImageProp.bind(this);
    this.createTinyFiles = this.createTinyFiles.bind(this);
    this.handleArrowPress = this.handleArrowPress.bind(this);

  }

  warnModalClose() {
    if (window.confirm('Do you want to discard this post?')) {
      this.props.closeModal();
    }
  }

  transformImageProp(validFiles) {
    let imageArray = validFiles;
    Promise
      .all(
        imageArray.map((file) => this.loadImage(file))
      )
      .then(
        result => {
          this.setState({
            imageArray: result,
            displayedItemCount: result.length,
            validFiles: validFiles,
            isCompressing: true
          },
            this.createTinyFiles(validFiles)
          )
        });
  }

  createTinyFiles(files) {
    let promisedCompression = [];
    for (const file of files) {
      promisedCompression.push(imageCompression(file, { maxSizeMB: 1 }));
    }
    promisedCompression.push(
      imageCompression(files[0], { maxSizeMB: 0.5, maxWidthOrHeight: 250 })
    );
    Promise.all(promisedCompression)
      .then((results) => {
        const thumbnail = new File([results[results.length - 1]], 'Thumbnail');
        let files = [];
        for (let i = 0; i < results.length - 1; i++) {
          files.push(new File([results[i]], 'file'))
        }

        this.setState({
          tinyPhotos: files,
          coverPhoto: thumbnail,
          isCompressing: false
        });
      })
  }

  loadImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        resolve(e.target.result);
      };
      reader.onerror = function () {
        reject(reader.error);
      }
      reader.readAsDataURL(file);
    });
  }

  handleIndexChange(value) {
    this.setState({ imageIndex: value });
  }

  handlePaginatedChange() {
    if (this.props.isPaginated === false) {
      let postArray = [];
      const imageCount = this.state.validFiles.length;
      postArray.push(this.state.textData);
      for (let i = 1; i < imageCount; i++) {
        postArray.push([]);
      }
      this.setState({ textData: postArray }, () => this.props.setIsPaginated(true));
    }
    else {
      if (window.confirm(`Switching back will remove all your captions except 
                          for the first one. Keep going?`
      )) {
        const textData = this.state.textData[0];
        this.setState({ textData: textData }, () => this.props.setIsPaginated(false));
      }
    }
  }

  setImageArray(imageArray) {
    this.setState({ imageArray: imageArray });
  }

  setSelectedFiles(value) {
    this.setState({ selectedFiles: value },
      this.generateValidFiles
    )
  }

  setValidFiles(value) {
    this.transformImageProp(value);
  }

  setUnsupportedFiles(value) {
    this.setState({ unsupportedFiles: value })
  }

  handleArrowPress(value) {
    const currentIndex = this.state.imageIndex + value;
    if (currentIndex === this.state.imageArray.length) {
      return (
        this.setState({
          imageIndex: 0,
        }));
    }
    else if (currentIndex === -1) {
      return (
        this.setState({
          imageIndex: this.state.imageArray.length - 1,

        }));
    }
    else {
      return (
        this.setState(({
          imageIndex: currentIndex,
        })));
    }
  }

  handleTextChange(text, isTitle) {
    if (isTitle) {
      this.props.setPreviewTitle(text);
    }
    else {
      let newState;
      const areFilesValid = this.state.validFiles.length === 0
        || this.state.unsupportedFiles.length > 0;
      if (this.props.isPaginated) {
        let updatedArray = this.state.textData;
        updatedArray[this.state.imageIndex] = text;
        newState = updatedArray;
      }
      else {
        newState = text;
      }
      this.setState(({
        textData: newState,
        postDisabled: (text.length === 0) && areFilesValid
      }));
    }

  }

  handleUnsupportedFileChange(file) {
    this.setState((state) => ({
      unsupportedFiles: state.unsupportedFiles.concat(file)
    }));
  }

  handleSelectedFileChange(file) {
    this.setState((state) => ({
      selectedFiles: state.selectedFiles.concat(file)
    }), this.generateValidFiles);
  }

  handleDisablePost(disabled) {
    this.setState({ postDisabled: disabled });
  }

  generateValidFiles() {
    let selectedFiles = this.state.selectedFiles;
    let filteredArr = selectedFiles.reduce((accumulator, current) => {
      const x = accumulator.find(item => item.name === current.name);
      if (!x) {
        return accumulator.concat([current]);
      } else {
        return accumulator;
      }
    }, []);
    this.setValidFiles(filteredArr);
  }

  handleSortEnd({ oldIndex, newIndex }) {
    const items = Array.from(this.state.validFiles);
    const [reorderedItem] = items.splice(oldIndex, 1);
    items.splice(newIndex, 0, reorderedItem);
    this.transformImageProp(items);
  }

  render() {
    if (this.props.window === 1) {
      const navFunctions = {
        onModalClose: this.warnModalClose,
        setPostStage: this.props.setPostStage,
      }

      const navStates = {
        previewTitle: this.props.previewTitle,
        isPostDisabled: this.state.postDisabled,
        isCompressing: this.state.isCompressing,
        window: this.props.window,
      }

      const editorStates = {
        selectedFiles: this.state.selectedFiles,
        validFiles: this.state.validFiles,
        imageArray: this.state.imageArray,
        unsupportedFiles: this.state.unsupportedFiles,
        text: this.state.textData,
        imageIndex: this.state.imageIndex,
      };

      const imageEditorFunctions = {
        onSortEnd: this.handleSortEnd,
        setImageArray: this.setImageArray,
        onPaginatedChange: this.handlePaginatedChange,
        handleArrowPress: this.handleArrowPress,
        onSelectedFileChange: this.handleSelectedFileChange,
        onUnsupportedFileChange: this.handleUnsupportedFileChange,
        onDisablePost: this.handleDisablePost,
        setValidFiles: this.setValidFiles,
        setSelectedFiles: this.setSelectedFiles,
        setUnsupportedFiles: this.setUnsupportedFiles,
        onTextChange: this.handleTextChange,
      };

      return (
        <ShortPostInitial
          {...navStates}
          {...navFunctions}
          {...this.props.initialDraftObject}
          editorStates={editorStates}
          editorFunctions={imageEditorFunctions}
        />
      );
    }
    else if (this.props.window === 2) {
      const required = {
        previousState: 1,
        setPostStage: this.props.setPostStage,
        handleTitleChange: this.handleTextChange
      }


      const optional = {
        imageArray: this.state.tinyPhotos,
        closeModal: this.props.closeModal
      }
      return (
        <MetaStage
          {...required}
          {...optional}
          {...this.props.metaObject}
          {...this.props.metaFunctions}
         />
      );
    }
    else if (this.props.window === 3) {

      const optional = {
        coverPhoto: this.state.coverPhoto,
        compressedPhotos: this.state.tinyPhotos,
      }
      return (
        <div className='small-post-window'>
          <ReviewStage
            {...optional}
            {...this.props.threadObject}
            {...this.props.threadFunction}
            previousState={2}
            textData={this.state.textData}
            closeModal={this.props.closeModal}
            setPostStage={this.props.setPostStage}
            setDraft={this.props.setDraft}
          />
        </div>
      );
    }
  }
}
export default ShortPost;