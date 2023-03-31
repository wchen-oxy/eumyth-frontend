import React from 'react';
import ShortReEditor from '../editor/short-re-editor';
import Comments from './comments';
import ReviewStage from '../draft/review-stage';
import CustomImageSlider from 'components/image-carousel/custom-image-slider';
import AxiosHelper from 'utils/axios';
import { returnUserImageURL } from 'utils/url';
import {
    EXPANDED,
    COLLAPSED,
    SHORT,
} from 'utils/constants/flags';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import ShortPostLargeContent from './large-content';
import ShortPostInlineContent from './inline-content';
import MetaStage from '../draft/meta-stage';
import MetaInfo from './sub-components/meta-info';
import Steps from '../draft/sub-components/steps';


const iterateDrafts = (drafts, projectID) => {
    let index = 0;
    for (const item of drafts) {
        if (item.content_id === projectID) {
            return drafts[index].content_id;
        }
        index++;
    };
    return null;
}

const findMatchedDraft = (drafts, projectPreviewRaw) => {
    if (drafts && projectPreviewRaw?.project_id) {
        return iterateDrafts(drafts, projectPreviewRaw.project_id);
    }
    else return null;
}
class ShortPostViewer extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            annotations: null,
            activeAnnotations: [],
            fullCommentData: [],
            areAnnotationsHidden: true,
            selectedAnnotationIndex: null,
            showPromptOverlay: false,
            projectPreview: null,
            isMetaToggled: false,

        };

        this.heroRef = React.createRef();
        this.commentRef = React.createRef();
        this.toggleAnnotations = this.toggleAnnotations.bind(this);
        this.passAnnotationData = this.passAnnotationData.bind(this);
        this.returnValidAnnotations = this.returnValidAnnotations.bind(this);
        this.renderComments = this.renderComments.bind(this);
        this.renderImageSlider = this.renderImageSlider.bind(this);
        this.handleArrowPress = this.handleArrowPress.bind(this);
        this.handlePromptAnnotation = this.handlePromptAnnotation.bind(this);
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
        this.handleMouseClick = this.handleMouseClick.bind(this);
        this.handleAnnotationSubmit = this.handleAnnotationSubmit.bind(this);
        this.handleModalLaunch = this.handleModalLaunch.bind(this);
        this.handleCommentDataInjection = this.handleCommentDataInjection.bind(this);
        this.deletePostCallback = this.deletePostCallback.bind(this);
        this.handleDeletePost = this.handleDeletePost.bind(this);
        this.loadProjectPreview = this.loadProjectPreview.bind(this);
        this.setMetaToggle = this.setMetaToggle.bind(this);
        this.jumpToComment = this.jumpToComment.bind(this);
        this.findAnnotation = this.findAnnotation.bind(this);
    }

    componentDidMount() {
        this._isMounted = true;
        if (this._isMounted) {
            let annotationArray = [];
            for (let i = 0; i < this.props.eventData.image_data.length; i++) {
                annotationArray.push([]);
            }
            this.setState({ annotations: annotationArray }, this.loadProjectPreview);
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    setMetaToggle(e) {
        e.stopPropagation()
        this.setState({ isMetaToggled: !this.state.isMetaToggled });
    }
    jumpToComment() {
        this.commentRef.current.scrollIntoView({ block: 'center' });
        this.commentRef.current.focus();
    }

    loadProjectPreview() { //this is overwriting the project preview from before
        const projectPreviewID = this.props.eventData.project_preview_id;
        if (projectPreviewID && !this.props.projectPreviewMap[projectPreviewID]) {
            return AxiosHelper.getSingleProjectPreview(projectPreviewID)
                .then((result) => {
                    this.setState({
                        projectPreview: result.data,
                    }, () => {
                        if (this.props.saveProjectPreview) {
                            this.props.saveProjectPreview(result.data);
                        }
                        // const draftData = findMatchedDraft(this.props.drafts, result.data);
                        // this.props.setDraft(draftData)
                    })
                });
        }
        else {
            const projectPreview = this.props.projectPreviewMap[projectPreviewID];
            this.setState({
                projectPreview,
                selectedDraft: findMatchedDraft(this.props.drafts, projectPreview)
            }, () => {
                // const draftData = findMatchedDraft(this.props.drafts, projectPreview);
                // this.props.setDraft(draftData)
            });
        }
    }

    deletePostCallback() {
        return AxiosHelper
            .deletePost(
                this.props.userPreviewID,
                this.props.profileID,
                this.props.indexProfileID,
                this.props.eventData._id,
                this.props.pursuit,
                this.props.minDuration,
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
            const currentPageAnnotations = this.state.annotations[this.props.imageIndex];
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
                <div>
                    <Comments
                        reference={this.commentRef}
                        postType={SHORT}
                        commentIDArray={this.props.eventData.comments}
                        fullCommentData={this.state.fullCommentData}
                        isImageOnly={isImageOnly}
                        windowType={windowType}
                        visitorUsername={this.props.username}
                        visitorProfilePreviewID={this.props.userPreviewID}
                        postID={this.props.eventData._id}
                        selectedIndex={this.props.selectedIndex}
                        onCommentDataInjection={this.handleCommentDataInjection}
                        onPromptAnnotation={this.handlePromptAnnotation}
                        passAnnotationData={this.passAnnotationData}
                        onMouseClick={this.handleMouseClick}
                        onMouseOver={this.handleMouseOver}
                        onMouseOut={this.handleMouseOut}
                    />
                </div>
            );
        }
        else if (windowType === COLLAPSED) {
            const dialogue = this.state.isMetaToggled ? "Hide Meta Info" : "Show Meta Info";
            const meta = this.props.initialViewerObject;
            const doesMetaExist = meta.difficulty !== 0 || meta.minDuration || meta.labels.length > 0;
            return (
                <div className='shortpostviewer-bottom-info'>
                    <div className='shortpostviewer-bottom-bar '>
                        <p>{this.props.eventData.comment_count} Comments</p>
                        {/* <button onClick={this.handleModalLaunch}>Expand Post</button> */}
                        <button
                            className={!doesMetaExist ? 'shortpostviewer-showmeta-disabled' : 'shortpostviewer-showmeta-enabled'}
                            disabled={!doesMetaExist}
                            onClick={this.setMetaToggle}>
                            {dialogue}
                        </button>
                    </div>

                    <div>
                        <MetaInfo isMetaToggled={this.state.isMetaToggled} {...this.props.initialViewerObject} />
                    </div>
                </div>

            )
        }
    }

    renderImageSlider(windowType, windowWidth) {
        const sliderClassName = this.props.largeViewMode ?
            'shortpostviewer-large-hero-image short-post-hero-image-container' :
            'shortpostviewer-inline-hero';
        const imageArray = this.props.eventData.image_data.map((key, i) =>
            returnUserImageURL(key)
        );
        return (
            <div className={sliderClassName}>
                <CustomImageSlider
                    sliderClassName={sliderClassName}
                    editProjectState={this.props.editProjectState}
                    windowType={windowType}
                    hideAnnotations={this.state.areAnnotationsHidden}
                    imageArray={imageArray}
                    activeAnnotations={this.state.activeAnnotations}
                    imageIndex={this.props.imageIndex}
                    showPromptOverlay={this.state.showPromptOverlay}
                    annotateButtonPressed={this.state.annotateButtonPressed}
                    areAnnotationsHidden={this.state.areAnnotationsHidden}
                    visitorProfilePreviewID={this.props.userPreviewID}
                    annotations={this.returnValidAnnotations()}
                    onAnnotationSubmit={this.handleAnnotationSubmit}
                    toggleAnnotations={this.toggleAnnotations}
                    onArrowPress={this.handleArrowPress}
                    onModalLaunch={this.handleModalLaunch}

                />
            </div>)
    }

    handleArrowPress(e, value) {
        e.stopPropagation();
        const currentIndex = this.props.imageIndex + value;
        const numOfImages = this.props.eventData.image_data.length;
        if (currentIndex === numOfImages) {
            return (
                this.setState({
                    selectedAnnotationIndex: null
                }), () => this.props.onIndexChange(0));
        }
        else if (currentIndex === -1) {
            return (
                this.setState({
                    selectedAnnotationIndex: null
                }), () => this.props.onIndexChange(numOfImages - 1));
        }
        else {
            return (
                this.setState(({
                    selectedAnnotationIndex: null
                }), () => this.props.onIndexChange(currentIndex)));
        }
    }

    handleCommentDataInjection(postIndex, fullCommentData, feedType) {
        let newCommentIDArray = this.props.eventData.comments;
        const newCommentID = fullCommentData[fullCommentData.length - 1]._id;
        newCommentIDArray.push(newCommentID)
        this.setState({ fullCommentData: fullCommentData }, () => {
            if (this.props.selectedIndex !== null && !this.props.isPostOnlyView) {
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

    findAnnotation(imageIndex) {

        this.props.onIndexChange(imageIndex)
        this.heroRef.current.scrollIntoView({
            block: 'center'
        });
    }

    handleMouseClick(id) {
        let imageIndex = 0;
        for (let array of this.state.annotations) {
            if (array.length > 0) {
                let annotationIndex = 0;
                for (let annotation of array) {
                    if (annotation.data.id === id) {
                        return this.setState({
                            selectedAnnotationIndex: annotationIndex,
                            areAnnotationsHidden: false,
                        }, this.findAnnotation(imageIndex))
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
                this.props.userPreviewID,
                this.props.eventData._id,
                this.props.imageIndex,
                JSON.stringify(data),
                JSON.stringify(geometry)
            )
            .then((result) => {
                const rootCommentIDArray = result.data.rootCommentIDArray;
                let newRootCommentData = result.data.newRootComment;
                const currentAnnotationArray =
                    this.state
                        .annotations[this.props.imageIndex]
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
                fullAnnotationArray[this.props.imageIndex] =
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

    handleModalLaunch() {
        if (!this.props.isPostOnlyView) {
            return (this.props.setModal(
                this.props.eventData,
                SHORT,
                this.props.postIndex));
        }
    }

    render() {
        const isOwnProfile = this.props.username === this.props.eventData.username;
        if (this.props.window === 1) { //1
            const hasImages = this.props.eventData.image_data?.length > 0 ? true : false;
            const header = {
                isOwnProfile,
                editProjectState: this.props.editProjectState,
            }

            const user = {
                displayPhoto: this.props.eventData.display_photo_key,
                username: this.props.eventData.username
            };

            const caption = {
                title: this.props.eventData.title,
                textData: this.props.tempText,
                isPaginated: this.props.isPaginated,
                imageIndex: this.props.imageIndex,
            }

            const meta = {
                ...this.props.initialViewerObject,
                projectPreview: this.state.projectPreview,
            };

            const sharedProps = {
                header,
                user,
                caption,
                meta,
                hasImages,
                annotations: this.state.annotations,
                renderImageSlider: this.renderImageSlider,
                renderComments: this.renderComments,
            };

            if (this.props.largeViewMode) {
                const activityFunctions = {
                    jumpToComment: this.jumpToComment,
                    onEditClick: this.props.setPostStage,
                    onDeletePost: this.handleDeletePost
                }
                return (
                    <ShortPostLargeContent
                        heroRef={this.heroRef}
                        activityFunctions={activityFunctions}
                        {...sharedProps}
                    />
                );
            }
            else {
                return (
                    <ShortPostInlineContent
                        windowWidth={this.props.windowWidth}

                        {...sharedProps}
                    />)


            }
        }
        else if (this.props.window === 2) {//2
            return (
                <div
                    id='shortpostviewer-reedit'
                    className='shortpostviewer-window'>
                    <h2>Edit your Post!</h2>
                    <div className='shortpostviewer-nav'>
                        <div className='shortpostviewer-prev'>
                            <button
                                className='shortpostviewer-buttons'
                                onClick={() => (this.props.setPostStage(1))}>
                                Return
                            </button>
                        </div>

                        <Steps current={1} />
                        <div className='shortpostviewer-next'>
                            <button
                                className='shortpostviewer-buttons'
                                onClick={() => this.props.setPostStage(3)}>
                                Review Post
                            </button>
                        </div>


                    </div>
                    <ShortReEditor
                        imageIndex={this.props.imageIndex}
                        eventData={this.props.eventData}
                        tempText={this.props.tempText}
                        isPaginated={this.props.isPaginated}
                        onArrowPress={this.handleArrowPress}
                        onTextChange={this.props.onTextChange}
                        onPaginatedChange={this.props.onPaginatedChange}
                    />
                </div>
            )
        }
        else if (this.props.window === 3) {
            const required = {
                previousState: 2,
                setPostStage: this.props.setPostStage,
                handleTitleChange: this.handleTextChange
            }

            return (
                <MetaStage
                    {...required}
                    {...this.props.metaObject}
                    {...this.props.metaFunctions}
                />
            );
        }
        else if (this.props.window === 4) {

            const optional = {
                useImageForThumbnail: this.state.useImageForThumbnail,
            }

            return (
                <div className='shortpostviewer-window'>
                    <ReviewStage
                        isUpdateToPost
                        isPostOnlyView={this.props.isPostOnlyView}
                        {...optional}
                        {...this.props.threadObject}
                        {...this.props.threadFunction}
                        previousState={3}
                        textData={this.props.tempText}
                        closeModal={this.props.closeModal}
                        setPostStage={this.props.setPostStage}
                        setDraft={this.props.setDraft}
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