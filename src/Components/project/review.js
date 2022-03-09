import React, { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import CustomMultiSelect from '../custom-clickables/createable-single';
import AxiosHelper from '../../utils/axios';
import {
    COVER_PHOTO_FIELD,
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
    TITLE_FIELD,
    USERNAME_FIELD,
    USER_ID_FIELD,
    USER_PREVIEW_ID_FIELD
} from 'utils/constants/form-data';
import { EDIT, TITLE, OVERVIEW } from 'utils/constants/flags';

const DRAFT = 'DRAFT';
const PUBLISHED = 'PUBLISHED';
const ProjectReview = (props) => {
    const [remix, setRemix] = useState(props.projectMetaData?.remix ?? null);
    const [pursuit, setPursuit] = useState(props.projectMetaData?.pursuit ?? null);
    const [startDate, setStartDate] = useState(props.projectMetaData?.start_date ?? null);
    const [endDate, setEndDate] = useState(props.projectMetaData?.end_date ?? null);
    const [isComplete, setIsComplete] = useState(false);
    const [duration, setDuration] = useState(0);
    const [coverPhoto, setCoverPhoto] = useState(null);
    const [labels, setLabels] = useState([]);
    const [removeCoverPhoto, setRemoveCoverPhoto] = useState(null);

    const handlePost = (status) => {
        let formData = new FormData();
        formData.append(TITLE_FIELD, props.title.trim());
        if (props.projectMetaData.ancestors && props.projectMetaData.ancestors.length > 0) {
            formData.append(IS_FORKED_FIELD, true);
            formData.append(
                PROJECT_PREVIEW_ID_FIELD,
                props.projectMetaData.project_preview_id
            );
        };
        if (remix.trim().length > 0) formData.append(REMIX, remix.trim());
        if (props.overview) formData.append(OVERVIEW_FIELD, props.overview.trim());
        if (pursuit) formData.append(PURSUIT_FIELD, pursuit);
        if (startDate) formData.append(START_DATE_FIELD, startDate);
        if (endDate) formData.append(END_DATE_FIELD, endDate);
        if (isComplete) formData.append(IS_COMPLETE_FIELD, isComplete);
        if (duration !== 0) formData.append(MIN_DURATION_FIELD, duration);
        if (coverPhoto) formData.append(COVER_PHOTO_FIELD, coverPhoto);
        if (labels.length > 0) {
            for (const label of labels) {
                formData.append(LABELS_FIELD, label.value);
            }
        }
        if (props.authUser.smallCroppedDisplayPhotoKey) formData.append(DISPLAY_PHOTO_FIELD, props.authUser.smallCroppedDisplayPhotoKey)
        for (const post of props.selectedPosts) formData.append(SELECTED_POSTS_FIELD, post);
        if (props.isUpdate) {
            formData.append(PROJECT_ID_FIELD, props.projectMetaData._id);
            formData.append(STATUS_FIELD, status);
            if (removeCoverPhoto) {
                if (!props.coverPhotoKey) throw new Error("Need cover Photo");
                return AxiosHelper.deletePhotoByKey(props.coverPhotoKey)
                    .then((result) => AxiosHelper.updateProject(formData))
                    .then((result => {
                        console.log(result);
                        alert("success!");
                        window.location.reload();
                    }));
            }
            return AxiosHelper.updateProject(formData)
                .then((result => {
                    console.log(result);
                    alert("success!");
                    window.location.reload();
                }))
        }
        else {
            formData.append(USERNAME_FIELD, props.authUser.username);
            formData.append(USER_ID_FIELD, props.authUser.profileID);
            formData.append(INDEX_USER_ID_FIELD, props.authUser.indexProfileID);
            formData.append(USER_PREVIEW_ID_FIELD, props.authUser.userPreviewID);
            formData.append(STATUS_FIELD, status);
            return AxiosHelper.createProject(formData)
                .then((result) => {
                    console.log(result);
                    alert("Success!");
                    window.location.reload();
                })
                .catch(err => console.log(err));
        }
    }
    console.log(remix.trim());
    return (
        <div >
            <div className="">
                <button onClick={() => props.onWindowSwitch(EDIT)}    >
                    Return
                </button>
            </div>
            <div id="projectcontroller-submit-container">
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
                    props.projectMetaData.project_preview_id && <label>Remix</label>}
                {
                    props.projectMetaData.project_preview_id &&

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
                <label>Is Complete</label>
                <input
                    type="checkbox"
                    onClick={() => setIsComplete(!isComplete)}
                />
                <label>Cover Photo</label>
                <input
                    type="file"
                    onChange={(e) => setCoverPhoto(e.target.files[0])}
                />
                <div>
                    <label>Tags</label>
                    <CustomMultiSelect
                        options={props.labels}
                        selectedLabels={props.selectedLabels}
                        name={"Tags"}
                        onSelect={setLabels}
                    />
                </div>
                <button
                    onClick={() => handlePost(DRAFT)}
                >
                    Save
                </button>
                <button
                    onClick={() => handlePost(PUBLISHED)}
                >
                    Submit
                </button>
            </div>

        </div>
    )
}

export default ProjectReview;