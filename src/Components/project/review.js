import React, { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import CustomMultiSelect from '../custom-clickables/createable-single';
import AxiosHelper from '../../utils/axios';
import {
    COVER_PHOTO_FIELD,
    MINI_COVER_PHOTO_FIELD,
    DISPLAY_PHOTO_FIELD,
    END_DATE_FIELD,
    INDEX_USER_ID_FIELD,
    IS_COMPLETE_FIELD,
    IS_FORKED_FIELD,
    LABELS_FIELD,
    MIN_DURATION_FIELD,
    OVERVIEW_FIELD,
    PROJECT_ID_FIELD,
    PROJECT_PREVIEW_ID_FIELD,
    PURSUIT_FIELD,
    REMIX,
    SELECTED_POSTS_FIELD,
    START_DATE_FIELD,
    STATUS_FIELD,
    USERNAME_FIELD,
    USER_ID_FIELD,
    USER_PREVIEW_ID_FIELD,
    REMOVE_COVER_PHOTO,
    SHOULD_UPDATE_PREVIEW_FIELD,
    THREAD_TITLE_FIELD
} from 'utils/constants/form-data';
import { EDIT, TITLE, OVERVIEW } from 'utils/constants/flags';
import { setFile } from 'utils';
import { draft } from 'utils/constants/states';

const DRAFT = 'DRAFT';
const PUBLISHED = 'PUBLISHED';
const ProjectReview = (props) => {
    const [remix, setRemix] = useState(props.projectMetaData?.remix ?? null);
    const [pursuit, setPursuit] = useState(props.projectMetaData?.pursuit ?? '');
    const [startDate, setStartDate] = useState(props.projectMetaData?.start_date ?? null);
    const [endDate, setEndDate] = useState(props.projectMetaData?.end_date ?? null);
    const [isComplete, setIsComplete] = useState(false);
    const [duration, setDuration] = useState(0);
    const [miniCoverPhoto, setMiniCoverPhoto] = useState(null);
    const [miniCoverPhotoBoolean, setMiniCoverPhotoBoolean] = useState(false);
    const [coverPhoto, setCoverPhoto] = useState(null);
    const [coverPhotoBoolean, setCoverPhotoBoolean] = useState(false);
    const [labels, setLabels] = useState([]);
    const [removeCoverPhoto, setRemoveCoverPhoto] = useState(null);
    const [hasLabelsBeenModified, setLabelsHasBeenModified] = useState(false);
    const [photoError, setPhotoError] = useState(false);

    const handleLabelChange = (labels) => {
        setLabelsHasBeenModified(true);
        setLabels(labels);
    }

    const uploadPhotos = (files) => {
        setFile(
            files[0],
            setMiniCoverPhotoBoolean,
            setMiniCoverPhoto,
            250,
            "miniCoverPhoto");

        setFile(
            files[0],
            setCoverPhotoBoolean,
            setCoverPhoto,
            1000,
            "coverPhoto"
        );
    }

    const clearPhotos = () => {
        setCoverPhoto(null);
        setMiniCoverPhoto(null);
        setCoverPhotoBoolean(false);
        setMiniCoverPhotoBoolean(false);
    }

    const handleSubmit = (status) => {
        if (status === PUBLISHED && !window.confirm(
            'Once You Publish, You Will Not Be Able To Make Changes to Your Project. Are You Sure?')) { return; }
        let formData = new FormData();
        formData.append(THREAD_TITLE_FIELD, props.title.trim());
        if (remix && remix.trim().length > 0) formData.append(REMIX, remix.trim());
        if (props.overview) formData.append(OVERVIEW_FIELD, props.overview.trim());
        if (pursuit) formData.append(PURSUIT_FIELD, pursuit);
        if (startDate) formData.append(START_DATE_FIELD, startDate);
        if (endDate) formData.append(END_DATE_FIELD, endDate);
        if (isComplete) formData.append(IS_COMPLETE_FIELD, isComplete);
        if (duration !== 0) formData.append(MIN_DURATION_FIELD, duration);
        if (coverPhoto && miniCoverPhoto) {
            formData.append(MINI_COVER_PHOTO_FIELD, miniCoverPhoto);
            formData.append(COVER_PHOTO_FIELD, coverPhoto);
        }
        if (labels.length > 0) {
            for (const label of labels) {
                formData.append(LABELS_FIELD, label.value);
            }
        }
        if (props.authUser.smallCroppedDisplayPhotoKey) formData.append(DISPLAY_PHOTO_FIELD, props.authUser.smallCroppedDisplayPhotoKey)
        for (const post of props.selectedPosts) formData.append(SELECTED_POSTS_FIELD, post);
        if (props.isUpdate) {
            updateProject(formData, status);
        }
        else {
            createProject(formData, status);
        }
    }

    const createProject = (formData, status) => {
        formData.append(USERNAME_FIELD, props.authUser.username);
        formData.append(USER_ID_FIELD, props.authUser.profileID);
        formData.append(INDEX_USER_ID_FIELD, props.authUser.indexProfileID);
        formData.append(USER_PREVIEW_ID_FIELD, props.authUser.userPreviewID);
        formData.append(STATUS_FIELD, status);
        return AxiosHelper.createProject(formData)
            .then((result) => {
                alert("Success!");
                window.location.reload();
            })
            .catch(err => console.log(err));
    }

    const updateProject = (formData, status) => {
        let promiseChain = Promise.resolve();
        const draftUpdateMeta = {
            indexUserID: props.authUser.indexProfileID,
            projectID: props.projectMetaData._id,
            threadTitle: props.title
        }
        const titlesAreDifferent = props.tite !== props.projectMetaData.title;
        const needsPreviewUpdates = hasLabelsBeenModified
            || titlesAreDifferent
            || pursuit !== props.projectMetaData?.pursuit;

        formData.append(SHOULD_UPDATE_PREVIEW_FIELD, needsPreviewUpdates);
        formData.append(PROJECT_ID_FIELD, props.projectMetaData._id);
        formData.append(STATUS_FIELD, status);

        if (needsPreviewUpdates) {
            const isForked = props.projectMetaData?.children && props.projectMetaData?.children.length > 0;
            formData.append(IS_FORKED_FIELD, isForked);
            formData.append(PROJECT_PREVIEW_ID_FIELD, props.projectMetaData.project_preview_id);
        }

        if (removeCoverPhoto) {
            const cover = props.projectMetaData?.coverPhoto ?? null;
            const miniCover = props.projectMetaData?.miniCoverPhoto ?? null;
            formData.append(REMOVE_COVER_PHOTO, true);
            if (!cover && !miniCover)
                throw new Error("Need cover Photo");
            promiseChain = promiseChain
                .then(AxiosHelper.deleteManyPhotosByKey([cover, miniCover]))

        }

        if (titlesAreDifferent) {
            // formData.append(THREAD_TITLE_FIELD, props.title)
            promiseChain = promiseChain
                .then(
                    AxiosHelper.updateCachedDraftTitle(
                        draftUpdateMeta.indexUserID,
                        draftUpdateMeta.projectID,
                        draftUpdateMeta.title
                    ))
        }

        promiseChain = promiseChain
            .then(AxiosHelper.updateProject(formData));

        return promiseChain
            .then(result => {
                alert("Done!");
                window.location.reload();
            })
            .catch(error => { console.log(error) });


    }


    const isCompressing = coverPhotoBoolean && !coverPhoto;
    let existingCoverPhotoKey = null;
    if (props.projectMetaData) {
        existingCoverPhotoKey = props.projectMetaData ? props.projectMetaData.coverPhoto : props.projectMetaData.cover_photo_key;
    }
    const isCoverReplace = existingCoverPhotoKey && removeCoverPhoto;
    const shouldShowCoverUpload = isCoverReplace || !existingCoverPhotoKey;

    return (
        <div>
            <div id="projectcontroller-return">
                <button onClick={() => props.onWindowSwitch(EDIT)}    >
                    Return
                </button>
            </div>
            <div id={props.isContentOnlyView ? "projectcontroller-content" : ""}>
            </div>
            <div id="projectcontroller-submit">
                {isCompressing && <label>One Moment, We Are Compressing Your Photo</label>}
                <label>Title</label>
                <TextareaAutosize
                    value={props.title}
                    onChange={(e) => props.handleInputChange(TITLE, e.target.value)}
                />
                <label>Overview</label>
                <TextareaAutosize
                    value={props.overview}
                    onChange={(e) => props.handleInputChange(OVERVIEW, e.target.value)}
                />
                {
                    props.projectMetaData?.parent_project_id && <label>Remix</label>}
                {
                    props.projectMetaData?.parent_project_id &&

                    <TextareaAutosize
                        value={remix}
                        onChange={(e) => setRemix(e.target.value)}
                    />
                }
                <label>Pursuit</label>
                <select
                    name="pursuit-category"
                    value={pursuit}
                    onChange={(e) => setPursuit(e.target.value)}
                >
                    {props.pursuitSelects}
                </select>
                <label>Start Date</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <label>End Date</label>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
                <label>Total Minutes</label>
                <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                />
                <span className='projectcontroller-checkbox-span'>
                    <input
                        type="checkbox"
                        onClick={() => setIsComplete(!isComplete)}
                    /> <label>Is Complete</label>
                </span>
                {existingCoverPhotoKey &&
                    <span className='projectcontroller-checkbox-span'>
                        <input
                            type="checkbox"
                            onClick={() => setRemoveCoverPhoto(!removeCoverPhoto)}
                        />
                        <label>Remove Cover Photo</label>
                    </span>
                }
                {shouldShowCoverUpload &&
                    <div>
                        <label>{existingCoverPhotoKey ? "Replace Your Cover Photo" : "Cover Photo"}</label>
                        <input
                            type="file"
                            onChange={(e) => uploadPhotos(e.target.files)}
                        />
                    </div>
                }

                {coverPhotoBoolean || miniCoverPhotoBoolean && <button onClick={clearPhotos}>Clear Photos</button>}
                <div>
                    <label>Tags</label>
                    <CustomMultiSelect
                        options={props.labels}
                        selectedLabels={props.selectedLabels}
                        name={"Tags"}
                        onSelect={handleLabelChange}
                    />
                </div>
                <button
                    disabled={isCompressing || !pursuit || !props.title}
                    onClick={() => handleSubmit(DRAFT)}
                >
                    Save
                </button>
                <button
                    disabled={isCompressing || !pursuit || !props.title}
                    onClick={() => handleSubmit(PUBLISHED)}
                >
                    Publish
                </button>
            </div>

        </div>
    )
}

export default ProjectReview;