import React from 'react';
import ShortEditor from '../editor/short-editor';
import TextareaAutosize from 'react-textarea-autosize';

import ReviewPost from './review-post';
import { INITIAL_STATE, REVIEW_STATE, SHORT, NONE, NEW_LONG, OLD_LONG } from "../../constants/flags";
import "./short-post.scss";
import imageCompression from 'browser-image-compression';

class ShortPost extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFiles: [],
      validFiles: [],
      unsupportedFiles: [],
      imageArray: [],
      imageIndex: 0,
      textData: '',
      isPaginated: false,
      postDisabled: true,
      window: INITIAL_STATE,
      previewTitle: null,
      tinyPhotos: null,

      //new draft stuff
      isLongDraftButtonToggled: false,

    };
    // this.handleTemplateInjection = this.handleTemplateInjection.bind(this);
    this.confirmDraftDiscard = this.confirmDraftDiscard.bind(this);
    this.longDraftOptionsRef = React.createRef(null);
    this.handleIndexChange = this.handleIndexChange.bind(this);
    this.toggleLongDraft = this.toggleLongDraft.bind(this);
    // this.handleTemplateSelect = this.handleTemplateSelect.bind(this);
    // this.returnOptions = this.returnOptions.bind(this);
    this.setSelectedFiles = this.setSelectedFiles.bind(this);
    this.setValidFiles = this.setValidFiles.bind(this);
    this.setUnsupportedFiles = this.setUnsupportedFiles.bind(this);
    this.setImageArray = this.setImageArray.bind(this);
    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleUnsupportedFileChange = this.handleUnsupportedFileChange.bind(this);
    this.handleSelectedFileChange = this.handleSelectedFileChange.bind(this);
    this.handleDisablePost = this.handleDisablePost.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.generateValidFiles = this.generateValidFiles.bind(this);
    this.handlePaginatedChange = this.handlePaginatedChange.bind(this);
    this.handleSortEnd = this.handleSortEnd.bind(this);
    this.loadImage = this.loadImage.bind(this);
    this.transformImageProp = this.transformImageProp.bind(this);
    this.createTinyFiles = this.createTinyFiles.bind(this);
    this.handleArrowPress = this.handleArrowPress.bind(this);

    this.newLongPost = this.newLongPost.bind(this);
  }

  confirmDraftDiscard() {
    this.props.onlineDraft ? (
      window.confirm(`Starting a new Long Post will
                      erase your saved draft. Continue anyway?`)
      && this.props.onPostTypeSet(NEW_LONG)
    ) : (
      this.props.onPostTypeSet(NEW_LONG));
  }

  toggleLongDraft(isShowing) {
    console.log(this.longDraftOptionsRef.current)

    if (isShowing) {
      this.longDraftOptionsRef.current.style.visibility = "hidden";
    }
    else {
      this.longDraftOptionsRef.current.style.visibility = "visible";
    }
    this.setState({ isLongDraftButtonToggled: !isShowing });
  }

  newLongPost(e) {
    !!this.props.onlineDraft ? (
      window.confirm(`Starting a new Long Post will
                        erase your saved draft. Continue anyway?`)
      && this.props.onPostTypeSet(e.target.value, null)
    ) : (
      this.props.onPostTypeSet(e.target.value, null));
  }

  transformImageProp(validFiles) {
    let imageArray = validFiles;
    Promise.all(imageArray.map((file) => this.loadImage(file)))
      .then(result => {
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
        const thumbnail = new File([results[results.length - 1]], "Thumbnail");
        let files = [];
        for (let i = 0; i < results.length - 1; i++) {
          files.push(new File([results[i]], "file"))
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
    if (this.state.isPaginated === false) {
      let postArray = [];
      const imageCount = this.state.validFiles.length;
      postArray.push(this.state.textData);
      for (let i = 1; i < imageCount; i++) {
        postArray.push([]);
      }
      this.setState({ textData: postArray, isPaginated: true });
    }
    else {
      if (window.confirm(`Switching back will remove all your captions except 
                          for the first one. Keep going?`
      )) {
        const textData = this.state.textData[0];
        this.setState({ textData: textData, isPaginated: false });
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
  handleTextChange(text, isPostText) {
    if (isPostText) {
      this.setState({ previewTitle: text });
    }
    else {
      let newState;
      const areFilesValid = this.state.validFiles.length === 0
        || this.state.unsupportedFiles.length > 0;
      if (this.state.isPaginated) {
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

  handleClick(value) {
    this.setState({ window: value });
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
    if (this.state.window === INITIAL_STATE) {
      return (
        <div id="shortpost-window">
          <h2>Short Post</h2>
          <div className="shortpost-button-container">
            <span >
            </span>
            {this.state.isCompressing ? <p>Compressing Photos</p> : null}
            <span>
              <button
                value={REVIEW_STATE}
                disabled={this.state.postDisabled}
                onClick={e => this.handleClick(e.target.value)}
              >
                Review Post
              </button>
            </span>
          </div>

          <div className="shortpost-special-button-container">
            <div id="shortpost-long-draft-options" ref={this.longDraftOptionsRef}>
              <button value={NEW_LONG} onClick={this.confirmDraftDiscard}>New Draft</button>
              <button value={OLD_LONG} onClick={() => this.props.onPostTypeSet(OLD_LONG)}>Continue Previous Draft</button>
            </div>
          </div>
          <div id="shortpost-title-container">
            <TextareaAutosize
              id='textcontainer-text-input'
              placeholder='Title'
              onChange={(e) => this.handleTextChange(e.target.value, true)}
              minRows={1}
              value={this.state.previewTitle} />
          </div>

          <ShortEditor
            username={this.props.username}
            selectedFiles={this.state.selectedFiles}
            validFiles={this.state.validFiles}
            imageArray={this.state.imageArray}
            unsupportedFiles={this.state.unsupportedFiles}
            isPaginated={this.state.isPaginated}
            textPageText={this.state.textData}
            onSortEnd={this.handleSortEnd}
            setImageArray={this.setImageArray}
            onPaginatedChange={this.handlePaginatedChange}
            // onIndexChange={this.handleIndexChange}
            imageIndex={this.state.imageIndex}
            handleArrowPress={this.handleArrowPress}
            onTextChange={this.handleTextChange}
            onSelectedFileChange={this.handleSelectedFileChange}
            onUnsupportedFileChange={this.handleUnsupportedFileChange}
            onDisablePost={this.handleDisablePost}
            setValidFiles={this.setValidFiles}
            setSelectedFiles={this.setSelectedFiles}
            setUnsupportedFiles={this.setUnsupportedFiles}
          />
        </div>
      );
    }
    else {
      const authUser = this.props.authUser;
      return (
        <div id="shortpost-review-window">
          <ReviewPost
            date={new Date().toISOString().substr(0, 10)}
            difficulty={0}
            progression={1}
            previousState={INITIAL_STATE}
            displayPhoto={authUser.displayPhoto}
            isPaginated={this.state.isPaginated}
            previewTitle={this.state.previewTitle}
            closeModal={this.props.closeModal}
            postType={SHORT}
            imageArray={this.state.tinyPhotos}
            coverPhoto={this.state.coverPhoto}
            textData={this.state.textData}
            username={authUser.username}
            preferredPostPrivacy={authUser.preferredPostPrivacy}
            pursuitNames={authUser.pursuitNames}
            labels={authUser.labels}
            handlePreferredPostPrivacyChange={this.props.handlePreferredPostPrivacyChange}
            setPostStage={this.handleClick}
          />
        </div>

      );
    }
  }
}
export default ShortPost;