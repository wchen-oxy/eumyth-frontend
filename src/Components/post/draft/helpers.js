import _ from 'lodash';
import {
    DRAFT,
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
    THREAD_TITLE_FIELD,

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

const appendSeriesUserMeta = (formData, fields) => {
    formData.append(USERNAME_FIELD, fields.username);
    formData.append(USER_ID_FIELD, fields.profileID);
    formData.append(INDEX_USER_ID_FIELD, fields.indexProfileID);
    formData.append(USER_PREVIEW_ID_FIELD, fields.userPreviewID);
}
const appendSeriesMeta = (formData, fields) => {
    formData.append(STATUS_FIELD, DRAFT);
    formData.append(THREAD_TITLE_FIELD, fields.threadTitle);
    formData.append(PURSUIT_FIELD, fields.selectedPursuit);
    formData.append(THREAD_TITLE_PRIVACY_FIELD, fields.titlePrivacy);
}

export const handleProjectCreation = (userMeta, seriesMeta) => {
    console.log(seriesMeta);
    let formData = new FormData();
    appendSeriesUserMeta(formData, userMeta);
    appendSeriesMeta(formData, seriesMeta);
    return AxiosHelper.createProject(formData);
}

export const handleCreatedProjectAppend = (results, formData) => {
    const newProjectID = results.data.id;
    const newProjectPreviewID = results.data.project_preview_id;
    formData.set(PROJECT_PREVIEW_ID_FIELD, results.data.project_preview_id);
    formData.append(SELECTED_DRAFT_ID, results.data.id);
    return {
        content_id: newProjectID,
        project_preview_id: newProjectPreviewID
    };
}

export const handlePostOwnerUpdate = (formData, postID, meta) => {
    formData.set(PROJECT_PREVIEW_ID_FIELD, meta.newProjectPreviewID);
    return AxiosHelper.updatePostOwner(
        meta.oldProjectPreviewID,
        meta.newProjectID,
        postID)
}

export const decideNewOrUpdate = (formData, functions, isPostOnlyView, isUpdate) => {

    let submit = isUpdate ? AxiosHelper.updatePost(formData) : AxiosHelper.createPost(formData);
    submit
        .then((result) => {
            functions.setIsSubmitting(false);
            result.status === 201 || result.status === 200 ? handleSuccess(isPostOnlyView, functions.closeModal)
                : handleError(functions.setLoading, functions.setError);
        })
        .catch((result) => {
            functions.setIsSubmitting(false);
            alert(result);
        })

}

//mark for deletion due to removal of coverPhoto manipulation
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


export const appendOptionalImageFields = (formData, fields) => {
    formData.append(COVER_PHOTO_FIELD, fields.coverPhoto);
    if (fields.imageArray && fields.imageArray.length > 0) {
        for (const image of fields.imageArray) {
            formData.append(IMAGES_FIELD, image);
        }
    }
}

export const appendPrimaryPostFields = (formData, fields) => {
    formData.append(USERNAME_FIELD, fields.username);
    formData.append(IS_PAGINATED_FIELD, fields.isPaginated);
    formData.append(DIFFICULTY_FIELD, fields.difficulty);
    formData.append(USER_PREVIEW_ID_FIELD, fields.userPreviewID);
    formData.append(INDEX_USER_ID_FIELD, fields.indexProfileID);
    fields.date && formData.append(DATE_FIELD, fields.date);
    fields.smallCroppedDisplayPhotoKey && formData.append(DISPLAY_PHOTO_FIELD, fields.smallCroppedDisplayPhotoKey);
    fields.previewTitle && formData.append(TITLE_FIELD, _.trim(fields.previewTitle));
    fields.postPrivacyType && formData.append(POST_PRIVACY_TYPE_FIELD, fields.postPrivacyType);
    fields.minDuration && formData.append(MIN_DURATION_FIELD, fields.minDuration);
    if (fields.labels) {
        for (const label of fields.labels) {
            formData.append(LABELS_FIELD, label.value);
        }
    }
    if (fields.textData) {
        const text = !fields.isPaginated ?
            fields.textData :
            JSON.stringify(fields.textData);
        formData.append(TEXT_DATA_FIELD, text);
    }
}

export const appendSecondarySeriesFields = (formData, fields) => {
    if (fields.selectedDraft) {
        formData.append(THREAD_TITLE_PRIVACY_FIELD, fields.titlePrivacy);
        formData.append(SELECTED_DRAFT_ID, fields.selectedDraft.content_id);
    }
    // formData.append(THREAD_TITLE_FIELD, fields.threadTitle);
    // formData.append(PURSUIT_FIELD, fields.selectedDraft.pursuit)
}

export const appendTertiaryUpdateFields = (formData, fields, isUpdate) => {
    if (isUpdate) {
        formData.append(POST_ID_FIELD, fields._id);
        formData.append(PROJECT_PREVIEW_ID_FIELD, fields.project_preview_id);
    }
}
