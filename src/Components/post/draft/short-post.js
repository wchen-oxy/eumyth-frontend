import React from 'react';
import imageCompression from 'browser-image-compression';
import ReviewStage from './review-stage';
import ShortPostInitial from './short-post-initial';
import MetaStage from './meta-stage';

class ShortPost extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      window: 1,
      selectedFiles: [],
      unsupportedFiles: [],
      imageArray: [],
      postDisabled: true,
    };

    this.warnModalClose = this.warnModalClose.bind(this);
    this.setSelectedFiles = this.setSelectedFiles.bind(this);
    this.setValidFiles = this.setValidFiles.bind(this);
    this.setUnsupportedFiles = this.setUnsupportedFiles.bind(this);
    this.setImageArray = this.setImageArray.bind(this);
    this.handleUnsupportedFileChange = this.handleUnsupportedFileChange.bind(this);
    this.handleSelectedFileChange = this.handleSelectedFileChange.bind(this);
    this.handleDisablePost = this.handleDisablePost.bind(this);
    this.generateValidFiles = this.generateValidFiles.bind(this);
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
    const needsCompression = validFiles.length > 0;
    let isDeletion = false;

    Promise
      .all(imageArray.map((file) => this.loadImage(file))
      )
      .then(
        result => {
          if (result.length < this.state.displayedItemCount) isDeletion = true;
          this.setState({
            imageArray: result,
            displayedItemCount: result.length,
            isCompressing: needsCompression
          },
            () => {
              if (needsCompression) {
                this.createTinyFiles(validFiles)
              }
            }
          )
        });
  }

  createTinyFiles(files) {
    let promisedCompression = [];
    for (const file of files) {
      promisedCompression.push(imageCompression(file, { maxSizeMB: 1 })); //all
    }
    promisedCompression.push( //cover photo
      imageCompression(files[0], { maxSizeMB: 0.5, maxWidthOrHeight: 250 })
    );
    Promise.all(promisedCompression)
      .then((results) => {
        const thumbnail = new File([results[results.length - 1]], 'Thumbnail');
        let files = [];
        for (let i = 0; i < results.length - 1; i++) {
          files.push(new File([results[i]], results[1].name))
        }

        this.setState({ isCompressing: false },
          () =>
            this.props.setPhotoData(
              thumbnail,
              files
            ));
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

  handleArrowPress(e, value) {
    e.stopPropagation();
    const currentIndex = this.props.imageIndex + value;
    if (currentIndex === this.state.imageArray.length) {
      return (
        this.props.onIndexChange(0));
    }
    else if (currentIndex === -1) {
      return (
        this.props.onIndexChange(this.props.compressedPhotos.length - 1)
      );
    }
    else {
      return (
        this.props.onIndexChange(currentIndex));
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
    const items = Array.from(this.props.compressedPhotos);
    const [reorderedItem] = items.splice(oldIndex, 1);
    items.splice(newIndex, 0, reorderedItem);
    this.transformImageProp(items);
  }

  render() {
    const areFilesValid = this.props.compressedPhotos.length === 0
      || this.state.unsupportedFiles.length > 0;

    if (this.props.window === 1) {
      const navFunctions = {
        onModalClose: this.warnModalClose,
        setPostStage: this.props.setPostStage,
      }

      const navStates = {
        previewTitle: this.props.previewTitle,
        isPostDisabled: (this.props.tempText.length === 0) && areFilesValid,
        isCompressing: this.state.isCompressing,
        window: this.props.window,
      }

      const editorStates = {
        selectedFiles: this.state.selectedFiles,
        validFiles: this.props.compressedPhotos,
        imageArray: this.state.imageArray,
        unsupportedFiles: this.state.unsupportedFiles,
        tempText: this.props.tempText,
        imageIndex: this.props.imageIndex,
      };

      const imageEditorFunctions = {
        onSortEnd: this.handleSortEnd,
        setImageArray: this.setImageArray,
        handleArrowPress: this.handleArrowPress,
        onSelectedFileChange: this.handleSelectedFileChange,
        onUnsupportedFileChange: this.handleUnsupportedFileChange,
        onDisablePost: this.handleDisablePost,
        setValidFiles: this.setValidFiles,
        setSelectedFiles: this.setSelectedFiles,
        setUnsupportedFiles: this.setUnsupportedFiles,
        onPaginatedChange: this.props.onPaginatedChange,
        onTextChange: this.props.onTextChange,
      };
      return (
        <ShortPostInitial
          {...navStates}
          {...navFunctions}
          {...this.props.initialDraftObject}
          isPaginated={this.props.isPaginated}
          editorStates={editorStates}
          editorFunctions={imageEditorFunctions}
        />
      );
    }
    else if (this.props.window === 2) {
      const required = {
        previousState: 1,
        setPostStage: this.props.setPostStage,
        handleTitleChange: this.props.onTextChange
      }


      const optional = {
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
      return (
        <div className='draft-window'>
          <ReviewStage
            {...this.props.threadObject}
            {...this.props.threadFunction}
            previousState={2}
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