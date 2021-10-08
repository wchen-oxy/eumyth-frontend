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
    LABELS_FIELD,
    MIN_DURATION_FIELD,
    OVERVIEW_FIELD,
    PURSUIT_FIELD,
    SELECTED_POSTS_FIELD,
    START_DATE_FIELD,
    TITLE_FIELD,
    USERNAME_FIELD,
    USER_ID_FIELD
} from 'utils/constants/form-data';
import { EDIT, TITLE, OVERVIEW } from 'utils/constants/flags';

const ProjectReview = (props) => {
    const [pursuit, setPursuit] = useState(props.pursuit);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const [duration, setDuration] = useState(null);
    const [coverPhoto, setCoverPhoto] = useState(null);
    const [labels, setLabels] = useState([]);

    const handlePost = () => {
        let formData = new FormData();
        if (props.overview) formData.append(OVERVIEW_FIELD, props.overview);
        if (pursuit) formData.append(PURSUIT_FIELD, pursuit);
        if (startDate) formData.append(START_DATE_FIELD, startDate);
        if (endDate) formData.append(END_DATE_FIELD, endDate);
        if (isComplete) formData.append(IS_COMPLETE_FIELD, isComplete);
        if (duration) formData.append(MIN_DURATION_FIELD, duration);
        if (coverPhoto) formData.append(COVER_PHOTO_FIELD, coverPhoto);
        if (labels.length > 0) formData.append(LABELS_FIELD, labels);
        if (props.selectedPosts) {
            formData.append(
                SELECTED_POSTS_FIELD,
                JSON.stringify(props.selectedPosts)
            );
        }

        if (props.isUpdate) {
            return AxiosHelper.updateProject(formData)
                .then((result => {

                }))
        }
        else {
            formData.append(USERNAME_FIELD, props.authUser.username);
            formData.append(DISPLAY_PHOTO_FIELD, props.authUser.smallCroppedDisplayPhotoKey)
            formData.append(USER_ID_FIELD, props.authUser.profileID);
            formData.append(INDEX_USER_ID_FIELD, props.authUser.indexProfileID);
            formData.append(TITLE_FIELD, props.title);
            return AxiosHelper.createProject(formData)

                .then((result) => {
                    alert("Success!");
                    window.location.reload();
                })
                .catch(err => console.log(err));
        }
    }

    return (
        <div >
            <div className="">
                <button onClick={() => props.handleWindowSwitch(EDIT)}    >
                    Return
                </button>
                <button
                    onClick={handlePost}
                >
                    Post!
                </button>
            </div>
            <div id="projectcontroller-submit-container">
                <TextareaAutosize
                    value={props.title}
                    onChange={(e) => props.handleInputChange(TITLE, e.target.value)}
                />
                <TextareaAutosize
                    value={props.overview}
                    onChange={(e) => props.handleInputChange(OVERVIEW, e.target.value)}
                />
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
                    onClick={handlePost}
                >
                    Submit
                </button>
            </div>

        </div>
    )
}

export default ProjectReview;