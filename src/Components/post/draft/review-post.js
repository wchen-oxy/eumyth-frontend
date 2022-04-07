import React, { useState } from 'react';
import _ from 'lodash';
import imageCompression from 'browser-image-compression';
import AxiosHelper from 'utils/axios';

import CustomMultiSelect from '../../custom-clickables/createable-single';
import CoverPhotoControls from './sub-components/cover-photo-controls';
import PrePostControls from './sub-components/pre-post-controls';
import DateInput from './sub-components/data-input';
import PursuitCategoryInput from './sub-components/pursuit-category-input';
import DifficultyInput from './sub-components/difficulty-input';
import ProgressInput from './sub-components/progress-input';
import MinutesInput from './sub-components/minutes-input';
import TitleInput from './sub-components/title-input';
import ProjectDraftControls from './sub-components/project-draft-controls';
import { displayDifficulty, } from 'utils/constants/ui-text';
import { SHORT, LONG, } from 'utils/constants/flags';
import {
    COVER_PHOTO_FIELD,
    DATE_FIELD,
    DIFFICULTY_FIELD,
    DISPLAY_PHOTO_FIELD,
    EXISTING,
    IMAGES_FIELD,
    LABELS_FIELD,
    IS_PAGINATED_FIELD,
    MIN_DURATION_FIELD,
    POST_ID_FIELD,
    POST_PRIVACY_TYPE_FIELD,
    POST_TYPE_FIELD,
    PROGRESSION_FIELD,
    PURSUIT_FIELD,
    REMOVE_COVER_PHOTO,
    SUBTITLE_FIELD,
    TEXT_DATA_FIELD,
    TITLE_FIELD,
    USERNAME_FIELD,
    INDEX_USER_ID_FIELD,
    SELECTED_DRAFT_ID,
    USER_PREVIEW_ID_FIELD,
    USER_ID_FIELD,
    STATUS_FIELD,
    THREAD_TITLE_PRIVACY_FIELD,
    COMPLETE_PROJECT_FIELD,

} from 'utils/constants/form-data';
import './review-post.scss';

const warn = () => alert(`One moment friend, I'm almost done compressing
your photo`);
const ReviewPost = (props) => {
    const [difficulty, setDifficulty] = useState(props.difficulty);
    const [date, setDate] = useState(props.date);
    const [minDuration, setMinDuration] = useState(null);
    const [progression, setProgression] = useState(props.progression);
    const [subtitle, setSubtitle] = useState('');
    const [postPrivacyType, setPostPrivacyType] = useState(props.authUser.preferredPostType);
    const [pursuit, setPursuit] = useState(
        props.selectedPursuit ? props.selectedPursuit : null)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [selectedDraft, setDraft] = useState(null);
    const [coverPhoto, setCoverPhoto] = useState(null);
    const [useCoverPhoto, setUseCoverPhoto] = useState(props.coverPhotoKey !== null && props.isUpdateToPost);
    const [useImageForThumbnail, setUseImageForThumbnail] = useState(props.coverPhotoKey);
    const [shouldRemoveSavedCoverPhoto, setShouldRemoveSavedCoverPhoto] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [labels, setLabels] = useState(null);

    const [threadToggleState, setToggleState] = useState(false);
    const [threadTitle, setThreadTitle] = useState('');
    const [titlePrivacy, setTitlePrivacy] = useState(false);
    const [isCompleteProject, setCompleteProject] = useState(false);


    const setFile = (file) => {
        if (!file) return;
        setUseCoverPhoto(true);
        return imageCompression(file, {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 250
        })
            .then((result) => {
                setCoverPhoto(new File([result], 'Cover'))
            })

    }

    const handleNewSubmit = (formData) => {
        if (threadToggleState) {
            formData.append(USER_ID_FIELD, props.authUser.profileID);
            formData.append(STATUS_FIELD, "DRAFT");
            formData.set(TITLE_FIELD, threadTitle);
            formData.append(THREAD_TITLE_PRIVACY_FIELD, titlePrivacy);
            return AxiosHelper.createProject(formData)
                .then((results) => {
                    console.log(results);
                    formData.append(SELECTED_DRAFT_ID, results.data.id);
                    formData.set(TITLE_FIELD, props.previewTitle);
                    console.log("New thread");
                    return AxiosHelper.createPost(formData)
                })
                .then((result) => {
                    console.log(result);
                    setIsSubmitting(false);
                    result.status === 201 ? handleSuccess() : handleError();
                })
                .catch((result) => {
                    setIsSubmitting(false);
                    console.log(result.error);
                    alert(result);
                })
        }
        else {
            formData.append(COMPLETE_PROJECT_FIELD, isCompleteProject)
            return AxiosHelper.createPost(formData)
                .then((result) => {
                    setIsSubmitting(false);
                    result.status === 201 ? handleSuccess() : handleError();
                })
                .catch((result) => {
                    setIsSubmitting(false);
                    alert(result);
                })

        }
    }

    const handleUpdateSubmit = (formData) => {
        return AxiosHelper.updatePost(formData)
            .then((result) => {
                setIsSubmitting(false);
                result.status === 200 ? handleSuccess() : handleError();
            }).catch((result) => {
                console.log(result.error);
                setIsSubmitting(false);
                alert(result);
            });
    }

    const handlePostSpecificForm = (formData, type) => {
        if (props.isUpdateToPost) {
            formData.append(POST_ID_FIELD, props.postID);
            formData.append(REMOVE_COVER_PHOTO, shouldRemoveSavedCoverPhoto);
            if (useImageForThumbnail) {
                if (!props.coverPhoto && !props.coverPhotoKey) {
                    return warn();
                }
                else {
                    formData.append(COVER_PHOTO_FIELD, props.coverPhoto);
                    return handleUpdateSubmit(formData);
                }
            }
            else if (!useImageForThumbnail && props.coverPhotoKey) {
                return AxiosHelper.deletePhotoByKey(props.coverPhotoKey)
                    .then(() => handleUpdateSubmit(formData));
            }
            else {
                return handleUpdateSubmit(formData)
            }
        }
        else {
            if (useImageForThumbnail) {
                if (!props.coverPhoto) { return warn(); }
                formData.append(COVER_PHOTO_FIELD, props.coverPhoto);
            }
            return handleNewSubmit(formData);
        }
    }

    const handleFormAppend = () => {
        setIsSubmitting(true);
        let formData = new FormData();
        formData.append(DATE_FIELD, date);
        formData.append(POST_TYPE_FIELD, props.postType);
        formData.append(USERNAME_FIELD, props.authUser.username);
        formData.append(IS_PAGINATED_FIELD, props.isPaginated);
        formData.append(PROGRESSION_FIELD, (progression));
        formData.append(DIFFICULTY_FIELD, difficulty);

        if (selectedDraft) {
            console.log(selectedDraft);
            formData.append(SELECTED_DRAFT_ID, selectedDraft);
        }
        if (props.authUser.smallCroppedDisplayPhotoKey) {
            formData.append(DISPLAY_PHOTO_FIELD, props.authUser.smallCroppedDisplayPhotoKey);
        }
        if (props.authUser.userPreviewID) formData.append(USER_PREVIEW_ID_FIELD, props.authUser.userPreviewID);
        if (props.authUser.indexProfileID) formData.append(INDEX_USER_ID_FIELD, props.authUser.indexProfileID);
        if (props.previewTitle) formData.append(TITLE_FIELD, _.trim(props.previewTitle));
        if (postPrivacyType) formData.append(POST_PRIVACY_TYPE_FIELD, postPrivacyType);
        if (pursuit) formData.append(PURSUIT_FIELD, pursuit);
        if (minDuration) formData.append(MIN_DURATION_FIELD, minDuration);
        if (subtitle) { formData.append(SUBTITLE_FIELD, _.trim(subtitle)); }
        if (labels) {
            for (const label of labels) {
                formData.append(LABELS_FIELD, label.value);
            }
        }
        if (props.textData) {
            const text = props.postType === SHORT && !props.isPaginated ?
                props.textData :
                JSON.stringify(props.textData);
            formData.append(TEXT_DATA_FIELD, text);
        }
        if (props.imageArray && props.imageArray.length > 0) {
            for (const image of props.imageArray) {
                formData.append(IMAGES_FIELD, image);
            }
        }

        handlePostSpecificForm(formData, props.postType);
    }

    const handleSuccess = () => {
        alert('Post Successful! You will see your post soon.');

        if (!props.isPostOnlyView) props.closeModal();
        window.location.reload();
    }

    const handleError = () => {
        setLoading(false);
        setError(true);
    }

    const handleReturnClick = (stageValue) => {
        if (props.postType === SHORT) {
            props.setPostStage(stageValue);
        }
        else if (props.postType === LONG) {
            props.setPostStage(stageValue, false)
        }
        else {
            throw new Error('No value matched for return click.');
        }
    }

    const disableCond1 = !selectedDraft;
    const disableCond2 = threadTitle.length === 0;
    console.log(!selectedDraft);
    console.log(threadTitle.length === 0);
    console.log('threadtoggle', threadToggleState)
    console.log(threadToggleState ? disableCond1 : disableCond2);


    return (
        < div id='reviewpost-small-window' >
            <div>
                <div>
                    <div id='reviewpost-header'>
                        <h2>Add your metadata!</h2>
                        <p>Optional of course</p>
                    </div>
                    <div id="reviewpost-button-container">
                        <button
                            value={props.previousState}
                            onClick={e => handleReturnClick(e.target.value)}
                        >
                            Return
                        </button>

                    </div>
                </div>
                <div  >
                    <TitleInput
                        postType={props.postType}
                        title={props.previewTitle}
                        setTitle={props.handleTitleChange}
                        setSubtitle={setSubtitle}
                    />
                    <ProjectDraftControls
                        drafts={props.authUser.drafts}
                        selectedDraft={selectedDraft}
                        titlePrivacy={titlePrivacy}
                        title={threadTitle}
                        toggleState={threadToggleState}
                        isCompleteProject={isCompleteProject}
                        setDraft={setDraft}
                        setTitlePrivacy={setTitlePrivacy}
                        setThreadTitle={setThreadTitle}
                        setToggleState={setToggleState}
                        setCompleteProject={setCompleteProject}
                    />
                    <CoverPhotoControls
                        useImageForThumbnail={useImageForThumbnail}
                        setUseImageForThumbnail={setUseImageForThumbnail}
                        useCoverPhoto={useCoverPhoto}
                        postType={props.postType}
                        isUpdateToPost={props.isUpdateToPost}
                        imageArray={props.imageArray}
                    />
                    <DateInput date={date} setDate={setDate} />
                    <PursuitCategoryInput
                        pursuitNames={props.authUser.pursuits.map(pursuit => pursuit.name)}
                        pursuit={props.pursuit}
                        setPursuit={setPursuit}
                    />

                    <MinutesInput
                        min={props.min}
                        setMinDuration={setMinDuration}
                    />
                    <DifficultyInput
                        difficulty={difficulty}
                        displayDifficulty={displayDifficulty}
                        setDifficulty={setDifficulty}
                    />
                    <ProgressInput
                        progression={progression}
                        setProgression={setProgression}
                    />
                </div>
                <div>
                    <label>Tags</label>
                    <CustomMultiSelect
                        options={props.authUser.labels}
                        selectedLabels={props.selectedLabels}
                        name={'Tags'}
                        onSelect={setLabels}
                    />

                </div>
                <div className='reviewpost-button-container'>
                    <PrePostControls
                        preferredPostPrivacy={postPrivacyType}
                        setPostPrivacyType={setPostPrivacyType}
                        handleFormAppend={handleFormAppend}
                        disabled={isSubmitting || threadToggleState ? disableCond2 : disableCond1}
                    />
                </div>
                {error && <p>An Error Occured. Please try again. </p>}
                {loading && <div>  <p> Loading...</p>  </div>}
            </div>
        </div >
    );
}

export default ReviewPost;