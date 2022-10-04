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

} from 'utils/constants/form-data';
import { SHORT, LONG, } from 'utils/constants/flags';
import AxiosHelper from 'utils/axios';

const addImages = (formData, fields) => {
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

const handleUpdateSubmit = (formData, fields, functions) => {
    // addImages(formData, fields.compressedPhotos); //DELETE?
    const updates = fields.isUpdateToPost && fields.projectPreviewID !== fields.selectedDraft ?
        AxiosHelper.updatePostOwner(fields.projectPreviewID, fields.selectedDraft, fields.postID) :
        AxiosHelper.updatePost(formData)
    return updates.then((result) => {
        functions.setIsSubmitting(false);
        result.status === 200 ?
            handleSuccess(fields.isPostOnlyView, functions.closeModal)
            : handleError(functions.setLoading, functions.setError);
    }).catch((result) => {
        console.log(result.error);
        functions.setIsSubmitting(false);
        alert(result);
    });
}


const handleNewSubmit = (formData, fields, functions) => {
    if (fields.threadToggleState) {
        formData.append(USER_ID_FIELD, fields.profileID);
        formData.append(STATUS_FIELD, "DRAFT");
        formData.set(TITLE_FIELD, fields.threadTitle);
        formData.append(THREAD_TITLE_PRIVACY_FIELD, fields.titlePrivacy);
        return AxiosHelper.createProject(formData)
            .then((results) => {
                formData.append(SELECTED_DRAFT_ID, results.data.id);
                formData.set(TITLE_FIELD, fields.previewTitle);
                addImages(formData, fields.compressedPhotos);
                return AxiosHelper.createPost(formData)
            })
            .then((result) => {
                console.log(result);
                functions.setIsSubmitting(false);
                result.status === 201 ? handleSuccess(fields.isPostOnlyView, functions.closeModal)
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
                result.status === 201 ? handleSuccess(fields.isPostOnlyView, functions.closeModal)
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

                return handleUpdateSubmit(formData, fields, functions);
            }
        }
        else if (!fields.useImageForThumbnail && fields.coverPhotoKey) {
            formData.append(REMOVE_COVER_PHOTO, fields.shouldRemoveSavedCoverPhoto);//should remove this?

            return AxiosHelper.deletePhotoByKey(fields.coverPhotoKey)
                .then(() => handleUpdateSubmit(formData, fields, functions));
        }
        else {
            return handleUpdateSubmit(formData, fields, functions);
        }
    }
    else {
        if (fields.useImageForThumbnail) {
            if (!fields.coverPhoto) { return warn(); }
            formData.append(COVER_PHOTO_FIELD, fields.coverPhoto);
        }
        return handleNewSubmit(formData, fields, functions);
    }
}


export const appendDefaultPostFields = (formData, defaults) => {
    
    formData.append(DATE_FIELD, defaults.date);
    formData.append(POST_TYPE_FIELD, defaults.postType);
    formData.append(USERNAME_FIELD, defaults.username);
    formData.append(IS_PAGINATED_FIELD, defaults.isPaginated);
    // formData.append(PROGRESSION_FIELD, (progression));
    formData.append(DIFFICULTY_FIELD, defaults.difficulty);
    if (defaults.smallCroppedDisplayPhotoKey) {
        formData.append(DISPLAY_PHOTO_FIELD, defaults.smallCroppedDisplayPhotoKey);
    }
    if (defaults.selectedPursuit) formData.append(PURSUIT_FIELD, defaults.selectedPursuit);
    if (defaults.isUpdateToPost) formData.append(POST_ID_FIELD, defaults.postID);
    if (defaults.selectedDraft) {
        formData.append(SELECTED_DRAFT_ID, defaults.selectedDraft);
    }
    if (defaults.userPreviewID) formData.append(USER_PREVIEW_ID_FIELD, defaults.userPreviewID);
    if (defaults.indexProfileID) formData.append(INDEX_USER_ID_FIELD, defaults.indexProfileID);
    if (defaults.previewTitle) formData.append(TITLE_FIELD, _.trim(defaults.previewTitle));
    if (defaults.postPrivacyType) formData.append(POST_PRIVACY_TYPE_FIELD, defaults.postPrivacyType);
    if (defaults.minDuration) formData.append(MIN_DURATION_FIELD, defaults.minDuration);
    // if(subtitle) { formData.append(SUBTITLE_FIELD, _.trim(subtitle)); }
    if (defaults.labels) {
        for (const label of defaults.labels) {
            formData.append(LABELS_FIELD, label.value);
        }
    }
    if (defaults.textData) {
        const text = defaults.postType === SHORT && !defaults.isPaginated ?
            defaults.textData :
            JSON.stringify(defaults.textData);
        formData.append(TEXT_DATA_FIELD, text);
    }
}

export const draftStateSetter = (props) => {
    return {

    }
}