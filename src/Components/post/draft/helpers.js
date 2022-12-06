import _ from 'lodash';
import {
    COVER_PHOTO_FIELD,
    DATE_FIELD,
    DIFFICULTY_FIELD,
    DISPLAY_PHOTO_FIELD,
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
    PROJECT_PREVIEW_ID_FIELD,

} from 'utils/constants/form-data';
import { SHORT, LONG, } from 'utils/constants/flags';
import AxiosHelper from 'utils/axios';

const addImages = (formData, fields) => {
    console.log(fields.imageArray);
    if (fields.imageArray && fields.imageArray.length > 0) {
        for (const image of fields.imageArray) {
            formData.append(IMAGES_FIELD, image);
        }
    }
}

const handleSuccess = (isPostOnlyView, closeModal) => {
    alert('Post Successful! You will see your post soon.');
    if (!isPostOnlyView) closeModal();
    window.location.reload();
}

const handleError = (setLoading, setError) => {
    setLoading(false);
    setError(true);
}

const handleProjectCreation = (formData, fields) => {
    formData.append(STATUS_FIELD, "DRAFT");
    formData.set(TITLE_FIELD, fields.threadTitle);
    formData.append(THREAD_TITLE_PRIVACY_FIELD, fields.titlePrivacy);
    return AxiosHelper.createProject(formData);
}

export const handleUpdateSubmit = (
    formData,
    fields,
    functions,
    isPostOnlyView,
    isNewSeriesToggled
) => {
    // addImages(formData, fields.compressedPhotos); //DELETE?
    if (isNewSeriesToggled) {
        console.log("new series toggled");
        return handleProjectCreation(formData, fields)
            .then(results => {
                const updates = fields.isUpdateToPost && fields.projectPreviewID !== fields.selectedDraft ?
                    AxiosHelper
                        .updatePostOwner(fields.projectPreviewID, results.data.id, fields.postID)
                        .then(results => {
                            formData.set(PROJECT_PREVIEW_ID_FIELD, results.data.project_preview_id);
                            return AxiosHelper.updatePost(formData)
                        }) :
                    AxiosHelper.updatePost(formData);
                return updates
                    //updaTE POST ITSELF NOW
                    .then((result) => {
                        functions.setIsSubmitting(false);
                        result.status === 200 ?
                            handleSuccess(isPostOnlyView, functions.closeModal)
                            : handleError(functions.setLoading, functions.setError);
                    })
            })
            .catch((result) => {
                console.log(result.error);
                functions.setIsSubmitting(false);
                alert(result);
            });
    }
    else {//get previewID and then chain the each update
        console.log(fields);
        const updates = fields.isUpdateToPost && fields.projectPreviewID !== fields.selectedDraft ?
            AxiosHelper
                .updatePostOwner(fields.projectPreviewID, fields.selectedDraft, fields.postID)
                .then(results => {
                    formData.set(PROJECT_PREVIEW_ID_FIELD, results.data.project_preview_id);
                    return AxiosHelper.updatePost(formData)
                }) :
            AxiosHelper.updatePost(formData);
        return updates.then((result) => {
            functions.setIsSubmitting(false);
            result.status === 200 ?
                handleSuccess(isPostOnlyView, functions.closeModal)
                : handleError(functions.setLoading, functions.setError);
        }).catch((result) => {
            console.log(result.error);
            functions.setIsSubmitting(false);
            alert(result);
        });
    }
}


export const handleNewSubmit = (
    formData,
    fields,
    functions,
    isPostOnlyView,
    isNewSeriesToggled
) => {
    console.log(fields);
    if (isNewSeriesToggled) {
        return handleProjectCreation(formData, fields)
            .then(results => {
                formData.append(SELECTED_DRAFT_ID, results.data.id);
                formData.set(TITLE_FIELD, fields.previewTitle);
                addImages(formData, fields);
                return AxiosHelper.createPost(formData);
            })
            .then((result) => {
                console.log(result);
                functions.setIsSubmitting(false);
                result.status === 201 ? handleSuccess(isPostOnlyView, functions.closeModal)
                    : handleError(functions.setLoading, functions.setError);
            })
            .catch((result) => {
                functions.setIsSubmitting(false);
                console.log(result.error);
                alert(result);
            })
    }
    else {
        formData.append(COMPLETE_PROJECT_FIELD, fields.isCompleteProject)
        return AxiosHelper.createPost(formData)
            .then((result) => {
                functions.setIsSubmitting(false);
                result.status === 201 ? handleSuccess(isPostOnlyView, functions.closeModal)
                    : handleError(functions.setLoading, functions.setError);
            })
            .catch((result) => {
                functions.setIsSubmitting(false);
                alert(result);
            })

    }
}

export const appendImageFields = (formData, fields, functions) => {
    const warn = () => alert(`One moment friend, I'm almost done compressing
    your photo`);
    
    if (fields.isUpdateToPost) { //isupdate
        if (fields.useImageForThumbnail) {
            if (!fields.coverPhoto && !fields.coverPhotoKey) {
                return warn();
            }
            else {
                formData.append(COVER_PHOTO_FIELD, fields.coverPhoto);
                formData.append(REMOVE_COVER_PHOTO, fields.shouldRemoveSavedCoverPhoto);//should remove this?
            }
        }
        else if (!fields.useImageForThumbnail && fields.coverPhotoKey) {
            formData.append(REMOVE_COVER_PHOTO, fields.shouldRemoveSavedCoverPhoto);//should remove this?
        }
    }
    else if (fields.useImageForThumbnail) {
        if (!fields.coverPhoto) { return warn(); }
        formData.append(COVER_PHOTO_FIELD, fields.coverPhoto);
    }

}


export const appendPrimaryPostFields = (formData, defaults) => {
    formData.append(USERNAME_FIELD, defaults.username);
    formData.append(USER_ID_FIELD, defaults.profileID);
    formData.append(IS_PAGINATED_FIELD, defaults.isPaginated);
    formData.append(DIFFICULTY_FIELD, defaults.difficulty);
    formData.append(USER_PREVIEW_ID_FIELD, defaults.userPreviewID);
    formData.append(INDEX_USER_ID_FIELD, defaults.indexProfileID);
    defaults.date && formData.append(DATE_FIELD, defaults.date);
    defaults.smallCroppedDisplayPhotoKey && formData.append(DISPLAY_PHOTO_FIELD, defaults.smallCroppedDisplayPhotoKey);
    defaults.isUpdateToPost && formData.append(POST_ID_FIELD, defaults.postID);
    defaults.threadTitle && formData.append(TITLE_FIELD, defaults.threadTitle);
    defaults.previewTitle && formData.append(TITLE_FIELD, _.trim(defaults.previewTitle));
    defaults.postPrivacyType && formData.append(POST_PRIVACY_TYPE_FIELD, defaults.postPrivacyType);
    defaults.minDuration && formData.append(MIN_DURATION_FIELD, defaults.minDuration);
    if (defaults.labels) {
        for (const label of defaults.labels) {
            formData.append(LABELS_FIELD, label.value);
        }
    }
    if (defaults.textData) {
        const text = !defaults.isPaginated ?
            defaults.textData :
            JSON.stringify(defaults.textData);
        formData.append(TEXT_DATA_FIELD, text);
    }

    if (defaults.selectedDraft) {
        formData.append(SELECTED_DRAFT_ID, defaults.selectedDraft.content_id);
        formData.append(PURSUIT_FIELD, defaults.selectedDraft.pursuit)
    }
    else{
        formData.append(PURSUIT_FIELD, defaults.selectedPursuit);
    }
}

export const draftStateSetter = (props) => {
    return {

    }
}