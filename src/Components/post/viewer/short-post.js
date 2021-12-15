import React from 'react';
import imageCompression from 'browser-image-compression';
import Comments from './comments';
import PostHeader from './sub-components/post-header';
import ShortHeroText from './sub-components/short-text';
import ShortPostMetaInfo from './sub-components/short-post-meta';
import ShortReEditor from '../editor/short-re-editor';
import ReviewPost from '../draft/review-post';
import CustomImageSlider from 'components/image-carousel/custom-image-slider';
import AxiosHelper from 'utils/axios';
import { returnUserImageURL } from 'utils/url';
import {
    EXPANDED,
    COLLAPSED,
    SHORT,
    INITIAL_STATE,
    EDIT_STATE,
    REVIEW_STATE
} from 'utils/constants/flags';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'components/image-carousel/index.scss';
import './short-post.scss';


class ShortPostViewer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            annotations: null,
            activeAnnotations: [],
            fullCommentData: [],
            areAnnotationsHidden: true,
            selectedAnnotationIndex: null,
            imageIndex: 0,
            selectedFiles: [],
            validFiles: [],
            unsupportedFiles: [],
            showPromptOverlay: false,
            date: this.props.eventData.date,
            min: this.props.eventData.min_duration,
            pursuitCategory: this.props.eventData.pursuit_category,
            isPaginated: this.props.eventData.is_paginated,
            progression: this.props.eventData.progression,
            postDisabled: true,
            window: INITIAL_STATE,
            tempTextForEdit: this.props.textData,
        };

        this.heroRef = React.createRef();
        this.toggleAnnotations = this.toggleAnnotations.bind(this);
        this.passAnnotationData = this.passAnnotationData.bind(this);
        this.returnValidAnnotations = this.returnValidAnnotations.bind(this);
        this.retrieveThumbnail = this.retrieveThumbnail.bind(this);
        this.renderComments = this.renderComments.bind(this);
        this.renderImageSlider = this.renderImageSlider.bind(this);
        this.handleArrowPress = this.handleArrowPress.bind(this);
        this.handlePromptAnnotation = this.handlePromptAnnotation.bind(this);
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
        this.handleMouseClick = this.handleMouseClick.bind(this);
        this.handleAnnotationSubmit = this.handleAnnotationSubmit.bind(this);
        this.handleWindowChange = this.handleWindowChange.bind(this);
        this.handleIndexChange = this.handleIndexChange.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.handlePaginatedChange = this.handlePaginatedChange.bind(this);
        this.handleModalLaunch = this.handleModalLaunch.bind(this);
        this.handleCommentDataInjection = this.handleCommentDataInjection.bind(this);
        this.deletePostCallback = this.deletePostCallback.bind(this);
        this.handleDeletePost = this.handleDeletePost.bind(this);
    }

    componentDidMount() {
        let annotationArray = [];
        for (let i = 0; i < this.props.eventData.image_data.length; i++) {
            annotationArray.push([]);
        }
        this.setState({ annotations: annotationArray });
    }

    deletePostCallback() {
        return AxiosHelper
            .deletePost(
                this.props.authUser.profileID,
                this.props.authUser.indexProfileID,
                this.props.eventData._id,
                this.props.eventData.pursuit_category,
                this.props.eventData.min_duration,
                this.props.eventData.progression,
            )
            .then((result) => {
                if (this.props.projectID) {
                    window.location.replace('/c/' + this.props.projectID);
                }
                else {
                    window.location.replace('/u/' + this.props.eventData.username)
                }
            })
            .catch((err) => {
                console.log(err);
                alert('Something went wrong during deletion');
            });
    }

    handleDeletePost() {
        if (this.props.eventData.image_data.length) {
            let imageArray = this.props.eventData.image_data;
            if (this.props.eventData.cover_photo_key) {
                imageArray.push(this.props.eventData.cover_photo_key)
            }
            return AxiosHelper.deleteManyPhotosByKey(imageArray)
                .then((results) => this.deletePostCallback());
        }
        else {
            return this.deletePostCallback();
        }
    }

    toggleAnnotations() {
        if (this.state.areAnnotationsHidden) {
            this.setState(({
                areAnnotationsHidden: false,
                annotateButtonPressed: false
            }));
        }
        else {
            this.setState(({
                areAnnotationsHidden: true,
                selectedAnnotationIndex: null,
                annotateButtonPressed: false
            }));
        }
    }

    passAnnotationData(rawComments) {
        let annotations = this.state.annotations;
        if (rawComments) {
            for (const comment of rawComments) {
                if (comment.annotation) {
                    const data = JSON.parse(comment.annotation.data);
                    const geometry = JSON.parse(comment.annotation.geometry);
                    annotations[comment.annotation.image_page_number].push({
                        geometry, data: {
                            ...data,
                            id: comment._id
                        }
                    });
                }
            }
        }
        this.setState({
            fullCommentData: rawComments ? rawComments : [],
            annotations: annotations,
        })
    }

    returnValidAnnotations() {
        if (!this.state.annotations) return [];
        else {
            const currentPageAnnotations = this.state.annotations[this.state.imageIndex];
            return (this.state.selectedAnnotationIndex !== null ? (
                [currentPageAnnotations[this.state.selectedAnnotationIndex]]) :
                (currentPageAnnotations));
        }
    }

    renderComments(windowType) {
        if (windowType === EXPANDED) {
            if (this.props.disableCommenting) {
                return null;
            }
            const isImageOnly = this.props.eventData.image_data.length ? true : false;
            return (
                <Comments
                    postType={SHORT}
                    commentIDArray={this.props.eventData.comments}
                    fullCommentData={this.state.fullCommentData}
                    isImageOnly={isImageOnly}
                    windowType={windowType}
                    visitorUsername={this.props.authUser?.username}
                    visitorProfilePreviewID={this.props.authUser?.userPreviewID}
                    postID={this.props.eventData._id}
                    postIndex={this.props.postIndex}
                    onCommentDataInjection={this.handleCommentDataInjection}
                    selectedPostFeedType={this.props.selectedPostFeedType}
                    onPromptAnnotation={this.handlePromptAnnotation}
                    passAnnotationData={this.passAnnotationData}
                    onMouseClick={this.handleMouseClick}
                    onMouseOver={this.handleMouseOver}
                    onMouseOut={this.handleMouseOut}
                />
            );
        }
        else if (windowType === COLLAPSED) {
            return (
                <p>{this.props.eventData.comment_count} Comments</p>
            )
        }
    }

    renderImageSlider(windowType) {
        const sliderClassName = this.props.largeViewMode ?
            'shortpostviewer-large-hero-image-container' :
            'shortpostviewer-inline-hero-container';
        let imageArray = this.props.eventData.image_data.map((key, i) =>
            returnUserImageURL(key)
        );
        return (
            <div className={sliderClassName}>
                <CustomImageSlider
                    editProjectState={this.props.editProjectState}
                    windowType={windowType}
                    hideAnnotations={this.state.areAnnotationsHidden}
                    imageArray={imageArray}
                    activeAnnotations={this.state.activeAnnotations}
                    imageIndex={this.state.imageIndex}
                    showPromptOverlay={this.state.showPromptOverlay}
                    annotateButtonPressed={this.state.annotateButtonPressed}
                    areAnnotationsHidden={this.state.areAnnotationsHidden}
                    visitorProfilePreviewID={this.props.authUser?.userPreviewID}
                    annotations={this.returnValidAnnotations()}
                    onAnnotationSubmit={this.handleAnnotationSubmit}
                    toggleAnnotations={this.toggleAnnotations}
                    onArrowPress={this.handleArrowPress}
                />
            </div>)
    }

    handleArrowPress(value) {
        const currentIndex = this.state.imageIndex + value;
        if (currentIndex === this.state.annotations.length) {
            return (
                this.setState({
                    imageIndex: 0,
                    selectedAnnotationIndex: null
                }));
        }
        else if (currentIndex === -1) {
            return (
                this.setState({
                    imageIndex: this.state.annotations.length - 1,
                    selectedAnnotationIndex: null
                }));
        }
        else {
            return (
                this.setState(({
                    imageIndex: currentIndex, selectedAnnotationIndex: null
                })));
        }
    }

    handleCommentDataInjection(postIndex, fullCommentData, feedType) {
        let newCommentIDArray = this.props.eventData.comments;
        const newCommentID = fullCommentData[fullCommentData.length - 1]._id;
        newCommentIDArray.push(newCommentID)
        this.setState({ fullCommentData: fullCommentData }, () => {
            if (this.props.postIndex !== null && !this.props.isPostOnlyView) {
                this.props.onCommentIDInjection(
                    postIndex,
                    newCommentIDArray,
                    feedType
                );
            }
        })
    }

    handlePromptAnnotation() {
        this.heroRef.current.scrollIntoView({ block: 'center' });
        this.setState({
            areAnnotationsHidden: false,
            annotateButtonPressed: true,
        });
    }

    handleMouseOver(id) {
        this.setState({
            activeAnnotations: [
                ...this.state.activeAnnotations,
                id
            ]
        })
    }

    handleMouseOut(id) {
        const index = this.state.activeAnnotations.indexOf(id)
        this.setState({
            activeAnnotations: [
                ...this.state.activeAnnotations.slice(0, index),
                ...this.state.activeAnnotations.slice(index + 1)
            ]
        })
    }

    handleMouseClick(id) {
        let imageIndex = 0;
        for (let array of this.state.annotations) {
            if (array.length > 0) {
                let annotationIndex = 0;
                for (let annotation of array) {
                    if (annotation.data.id === id) {
                        return this.setState({
                            imageIndex: imageIndex,
                            selectedAnnotationIndex: annotationIndex,
                            areAnnotationsHidden: false,
                        },
                            this.heroRef.current.scrollIntoView({
                                block: 'center'
                            }))
                    }
                    annotationIndex++;
                }
            }
            imageIndex++;
        }

    }

    handleAnnotationSubmit(annotation) {
        const { geometry, data } = annotation;
        AxiosHelper
            .postAnnotation(
                this.props.authUser?.userPreviewID,
                this.props.eventData._id,
                this.state.imageIndex,
                JSON.stringify(data),
                JSON.stringify(geometry)
            )
            .then((result) => {
                const rootCommentIDArray = result.data.rootCommentIDArray;
                let newRootCommentData = result.data.newRootComment;
                const currentAnnotationArray =
                    this.state
                        .annotations[this.state.imageIndex]
                        .concat({
                            geometry,
                            data: {
                                ...data,
                                id: rootCommentIDArray[0]
                            }
                        });
                let fullAnnotationArray = this.state.annotations;
                let fullCommentData = this.state.fullCommentData;
                fullCommentData.push(newRootCommentData);
                fullAnnotationArray[this.state.imageIndex] =
                    currentAnnotationArray;
                return this.setState({
                    annotations: fullAnnotationArray,
                    commentArray: rootCommentIDArray,
                    fullCommentData: fullCommentData,
                    annotateButtonPressed: false

                })
            })
            .catch((err) => {
                console.log(err);
                alert('Sorry, your annotation could not be added.');
            })
    }

    handleWindowChange(newWindow) {
        if (newWindow === EDIT_STATE && !this.props.eventData.cover_photo_key) {
            this.retrieveThumbnail();
        }

        this.setState({ window: newWindow });
    }

    handleIndexChange(value) {
        this.setState({ imageIndex: value });
    }

    handleTextChange(text) {
        let prevText = this.state.tempTextForEdit;
        if (this.state.isPaginated) {
            prevText[this.state.imageIndex] = text;
        }
        else {
            prevText = text;
        }
        this.setState({ tempTextForEdit: prevText });
    }

    handlePaginatedChange() {
        if (this.state.isPaginated === false) {
            const imageCount = this.props.eventData.image_data.length;
            let postArray = [];
            for (let i = 0; i < imageCount; i++) {
                if (i === this.state.imageIndex) {
                    postArray.push(this.state.tempTextForEdit);
                }
                else {
                    postArray.push([]);
                }
            }
            this.setState({ tempTextForEdit: postArray, isPaginated: true });
        }
        else {
            if (window.confirm(`Switching back will remove all your captions except 
                                for the current one. Keep going?`
            )) {
                const textData = this.state.tempTextForEdit[this.state.imageIndex];
                this.setState({ tempTextForEdit: textData, isPaginated: false });
            }
        }
    }

    handleModalLaunch() {
        if (!this.props.isPostOnlyView) {
            return (this.props.passDataToModal(
                this.props.eventData,
                SHORT,
                this.props.postIndex));
        }
    }

    retrieveThumbnail() {
        if (this.props.eventData.image_data.length > 0) {
            return AxiosHelper.returnImage(this.props.eventData.image_data[0])
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

    render() {
        const isOwnProfile = this.props.authUser?.username === this.props.eventData.username;
        if (this.state.window === INITIAL_STATE) {
            if (!this.props.eventData.image_data.length) {
                if (this.props.largeViewMode) {
                    return (
                        <div className='shortpostviewer-window'>
                            <div id='shortpostviewer-large-inline-header-container'>
                                <PostHeader
                                    isOwnProfile={isOwnProfile}
                                    editProjectState={this.props.editProjectState}
                                    username={this.props.eventData.username}
                                    date={this.state.date}
                                    displayPhoto={this.props.eventData.display_photo_key}
                                    onEditClick={this.handleWindowChange}
                                    onDeletePost={this.handleDeletePost}
                                />
                            </div>
                            <ShortPostMetaInfo
                                difficulty={this.props.eventData.difficulty}
                                isPaginated={this.state.isPaginated}
                                isFullPage={true}
                                progression={this.state.progression}
                                labels={this.props.eventData.labels}
                                pursuit={this.state.pursuitCategory}
                                min={this.state.min}
                                textData={null}
                            />

                            <div className='shortpostviewer-large-hero-text-container'>
                                <ShortHeroText
                                    title={this.props.eventData.title}
                                    textData={this.props.textData} />
                            </div>
                            {this.renderComments(EXPANDED)}
                        </div>
                    )
                }
                else {
                    return (
                        <div onClick={this.handleModalLaunch}>
                            <div className='shortpostviewer-inline-main-container' >

                                <div className='shortpostviewer-inline-side-container'>
                                    <PostHeader
                                        isOwnProfile={isOwnProfile}
                                        editProjectState={this.props.editProjectState}
                                        username={this.props.eventData.username}
                                        date={this.state.date}
                                        displayPhoto={this.props.eventData.display_photo_key}
                                    />
                                    <ShortPostMetaInfo
                                        index={this.state.imageIndex}
                                        isPaginated={this.state.isPaginated}
                                        progression={this.state.progression}
                                        labels={this.props.eventData.labels}
                                        pursuit={this.state.pursuitCategory}
                                        min={this.state.min}
                                        textData={null}

                                    />
                                </div>
                                <div className='shortpostviewer-inline-hero-container'>
                                    <ShortHeroText
                                        index={this.state.imageIndex}
                                        isPaginated={this.state.isPaginated}
                                        textData={this.props.textData} />
                                </div>
                            </div>
                            {this.renderComments(COLLAPSED)}
                        </div>
                    )
                }
            }
            //with images
            else {
                if (this.props.largeViewMode) {
                    return (
                        <div className='shortpostviewer-window'>
                            <div id='shortpostviewer-large-main-container'
                                className='with-image'
                            >
                                {this.state.annotations && this.renderImageSlider(EXPANDED)}
                                <div
                                    className='shortpostviewer-large-side-container'
                                    ref={this.heroRef}
                                >
                                    <PostHeader
                                        isOwnProfile={isOwnProfile}
                                        editProjectState={this.props.editProjectState}
                                        username={this.props.eventData.username}
                                        date={this.state.date}
                                        displayPhoto={this.props.eventData.display_photo_key}
                                        onEditClick={this.handleWindowChange}
                                        onDeletePost={this.handleDeletePost}
                                    />
                                    <ShortPostMetaInfo
                                        index={this.state.imageIndex}
                                        isPaginated={this.state.isPaginated}
                                        progression={this.state.progression}
                                        labels={this.props.eventData.labels}
                                        pursuit={this.state.pursuitCategory}
                                        min={this.state.min}
                                        textData={this.props.textData}
                                    />
                                </div>
                            </div>
                            {this.renderComments(EXPANDED)}
                        </div>
                    )
                }
                else {
                    return (
                        <>
                            <div
                                id='shortpostviewer-inline-main-container'
                                onClick={this.handleModalLaunch}
                            >
                                <PostHeader
                                    isOwnProfile={this.props.isOwnProfile}
                                    editProjectState={this.props.editProjectState}
                                    username={this.props.eventData.username}
                                    date={this.state.date}
                                    displayPhoto={this.props.eventData.display_photo_key}
                                />
                                <div className='shortpostviewer-inline-side-container'>
                                    <ShortPostMetaInfo
                                        index={this.state.imageIndex}
                                        isPaginated={this.state.isPaginated}
                                        progression={this.state.progression}
                                        labels={this.props.eventData.labels}
                                        pursuit={this.state.pursuitCategory}
                                        min={this.state.min}
                                        textData={this.props.textData}
                                    />
                                </div>
                                {this.state.annotations && this.renderImageSlider(COLLAPSED)}
                            </div>
                            {this.renderComments(COLLAPSED)}
                        </>
                    );
                }
            }
        }
        else if (this.state.window === EDIT_STATE) {
            return (
                <div className='shortpostviewer-window' >
                    <h4>Edit your Post!</h4>
                    <div className='shortpostviewer-button-container'>
                        <button
                            onClick={() => (this.handleWindowChange(INITIAL_STATE))}>
                            Return
                        </button>
                        <button
                            onClick={() => this.handleWindowChange(REVIEW_STATE)}>
                            Review Post
                        </button>

                    </div>
                    <ShortReEditor
                        imageIndex={this.state.imageIndex}
                        eventData={this.props.eventData}
                        textData={this.state.tempTextForEdit}
                        isPaginated={this.state.isPaginated}
                        onArrowPress={this.handleArrowPress}
                        onTextChange={this.handleTextChange}
                        onPaginatedChange={this.handlePaginatedChange}
                    />
                </div>
            )
        }
        else if (this.state.window === REVIEW_STATE) {
            let formattedDate = new Date().toISOString().substr(0, 10);
            if (this.props.eventData.date) {
                formattedDate =
                    new Date(this.props.eventData.date)
                        .toISOString()
                        .substring(0, 10);
            }
            return (
                <div className='shortpostviewer-window'>
                    <ReviewPost
                        isUpdateToPost
                        authUser={this.props.authUser}
                        isPostOnlyView={this.props.isPostOnlyView}
                        selectedLabels={this.props.eventData.labels}
                        difficulty={this.props.eventData.difficulty}
                        progression={this.props.eventData.progression}
                        previousState={EDIT_STATE}
                        postID={this.props.eventData._id}
                        coverPhoto={this.state.coverPhoto}
                        coverPhotoKey={this.props.eventData?.cover_photo_key ?? null}
                        isPaginated={this.state.isPaginated}
                        previewTitle={this.props.eventData.title}
                        previewSubtitle={this.props.eventData.subtitle}
                        date={formattedDate}
                        min={this.props.eventData.min_duration}
                        selectedPursuit={this.props.eventData.pursuit_category}
                        closeModal={this.props.closeModal}
                        postType={SHORT}
                        textData={this.state.tempTextForEdit}
                        handlePreferredPostPrivacyChange={this.handlePreferredPostPrivacyChange}
                        setPostStage={this.handleWindowChange}
                    />
                </div>
            );
        }
        else {
            throw new Error('No stage matched');
        }
    }

}

export default ShortPostViewer;