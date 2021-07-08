import React, { useState } from 'react';
import _ from 'lodash';
import TextareaAutosize from 'react-textarea-autosize';
import { PUBLIC_FEED, PERSONAL_PAGE, PRIVATE, SHORT, LONG, SETBACK, NEUTRAL, MILESTONE } from "../../constants/flags";
import imageCompression from 'browser-image-compression';
import AxiosHelper from '../../../Axios/axios';
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
    USERNAME_FIELD
} from "../../constants/form-data";
import { displayDifficulty, displayProgressionType } from "../../constants/ui-text";
import "./review-post.scss";
import CustomMultiSelect from '../../custom-clickables/createable-single';


const returnFinalProgressionType = (value) => {
    switch (parseInt(value)) {
        case (0):
            return SETBACK;
        case (1):
            return NEUTRAL;
        case (2):
            return MILESTONE;
        default:
            throw new Error("No Progress Type Matched in REVIEWPOST");
    }
}


const ReviewPost = (props) => {
    const [difficulty, setDifficulty] = useState(props.difficulty);
    const [date, setDate] = useState(props.date);
    const [minDuration, setMinDuration] = useState(null);
    const [progression, setProgression] = useState(props.progression);
    const [title, setTitle] = useState(props.previewTitle);
    const [subtitle, setSubtitle] = useState('');
    const [postPrivacyType, setPostPrivacyType] = useState(props.preferredPostPrivacy);
    const [pursuit, setPursuit] = useState(
        props.selectedPursuit ? props.selectedPursuit : null)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [coverPhoto, setCoverPhoto] = useState(null);
    const [useCoverPhoto, setUseCoverPhoto] = useState(props.coverPhotoKey !== null && props.isUpdateToPost);
    const [useImageForThumbnail, setUseImageForThumbnail] = useState(props.coverPhotoKey);
    const [shouldRemoveSavedCoverPhoto, setShouldRemoveSavedCoverPhoto] = useState(false);
    const [randomKey, setRandomKey] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [labels, setLabels] = useState(null);
    let pursuitSelects = [];

    const clearFile = () => {
        setUseCoverPhoto(false);
        if (!shouldRemoveSavedCoverPhoto && coverPhoto !== null &&
            window.confirm("Are you sure you want to remove your current cover photo?")) {
            setCoverPhoto(null);
            setRandomKey(randomKey + 1);
        }
        else if (!shouldRemoveSavedCoverPhoto &&
            window.confirm("Are you sure you want to remove your saved cover photo?"
            )) {
            setShouldRemoveSavedCoverPhoto(true);
        }
        else if (shouldRemoveSavedCoverPhoto) {
            setShouldRemoveSavedCoverPhoto(false);
        }
    }
    const setFile = (file) => {
        if (!file) return;
        setUseCoverPhoto(true);
        return imageCompression(file, {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 250
        })
            .then((result) => {
                setCoverPhoto(new File([result], "Cover"))
            })

    }
    const handleNewSubmit = (formData) => {
        return AxiosHelper.createPost(formData)
            .then((result) => {
                setIsSubmitting(false);
                result.status === 201 ? handleSuccess() : handleError();
            })
            .catch((result) => {
                setIsSubmitting(false);
                console.log(result.error);
                alert(result);
            });
    }
    const handlePostSpecificForm = (formData, type) => {
        if (type === SHORT) {
            if (props.isUpdateToPost) {
                formData.append(POST_ID_FIELD, props.postID);
                formData.append(REMOVE_COVER_PHOTO, shouldRemoveSavedCoverPhoto)
                if (useImageForThumbnail) {
                    if (!props.coverPhoto && !props.coverPhotoKey) {
                        return alert(`One moment friend, I'm almost done compressing
                        your photo`);
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
                    if (!props.coverPhoto) {
                        return alert(`One moment friend, I'm almost
                                     done compressing your photo`);
                    }
                    formData.append(COVER_PHOTO_FIELD, props.coverPhoto);
                }
                return handleNewSubmit(formData);
            }
        }
        else if (type === LONG) {
            if (props.isUpdateToPost) {
                formData.append(POST_ID_FIELD, props.postID);
                formData.append(REMOVE_COVER_PHOTO, shouldRemoveSavedCoverPhoto)
                if (useCoverPhoto) {
                    if (!coverPhoto && !props.coverPhotoKey) {
                        return alert(`One moment friend, I'm almost 
                                    done compressing your photo`)
                    }
                    else {
                        formData.append(COVER_PHOTO_FIELD, coverPhoto);
                        return handleUpdateSubmit(formData)
                    }
                }
                else if (props.coverPhotoKey) {
                    if (shouldRemoveSavedCoverPhoto) {
                        return AxiosHelper.deletePhotoByKey(props.coverPhotoKey)
                            .then(() => handleUpdateSubmit(formData));
                    }
                    else {
                        return handleUpdateSubmit(formData);
                    }
                }
                else {
                    return handleUpdateSubmit(formData);
                }
            }
            else {
                if (useCoverPhoto) {
                    if (!coverPhoto) {
                        return alert(`One moment friend, I'm almost 
                                    done compressing your photo`)
                    };
                    formData.append(COVER_PHOTO_FIELD, coverPhoto);
                }
                return handleNewSubmit(formData);
            }
        }
        else {
            throw new Error("No Content Type matched in reviewpost")
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

    const handleFormAppend = () => {
        setIsSubmitting(true);
        let formData = new FormData();
        formData.append(DATE_FIELD, date);
        formData.append(POST_TYPE_FIELD, props.postType);
        formData.append(USERNAME_FIELD, props.username);
        formData.append(IS_PAGINATED_FIELD, props.isPaginated);
        formData.append(PROGRESSION_FIELD, (progression));
        if (props.displayPhoto) formData.append(DISPLAY_PHOTO_FIELD, props.displayPhoto);
        if (difficulty) formData.append(DIFFICULTY_FIELD, difficulty);
        if (title) formData.append(TITLE_FIELD, _.trim(title));
        if (postPrivacyType) formData.append(POST_PRIVACY_TYPE_FIELD, postPrivacyType);
        if (pursuit) formData.append(PURSUIT_FIELD, pursuit);
        if (minDuration) formData.append(MIN_DURATION_FIELD, minDuration);
        if (subtitle) {
            formData.append(SUBTITLE_FIELD, _.trim(subtitle));
        }
        if (labels) {
            for (const label of labels) {
                formData.append(LABELS_FIELD, label.value);
            }
        }
        if (props.textData) {
            formData.append(
                TEXT_DATA_FIELD,
                props.postType === SHORT && !props.isPaginated ?
                    props.textData :
                    JSON.stringify(props.textData)
            );
        }

        if (props.imageArray && props.imageArray.length > 0) {
            for (const image of props.imageArray) {
                formData.append(IMAGES_FIELD, image);
            }
        }
        handlePostSpecificForm(formData, props.postType);
    }

    const renderCoverPhotoControl = () => {
        if (props.postType === SHORT) {
            if (props.isUpdateToPost || !props.isUpdateToPost && props.imageArray)
                return (
                    <div>
                        <label>Use First Image For Thumbnail</label>
                        <input
                            type="checkbox"
                            defaultChecked={useImageForThumbnail}
                            onChange={() => {
                                setUseImageForThumbnail(!useImageForThumbnail)
                            }
                            }
                        />
                    </div>
                )
            else {
                return null;
            }
        }

        else if (props.postType === LONG) {
            return (<div>
                {props.coverPhotoKey ?
                    (<label>Upload New Cover Photo?</label>)
                    :
                    (<label>Upload a Cover Photo</label>)
                }
                <input
                    type="file"
                    key={randomKey}
                    onChange={(e) => setFile(e.target.files[0])}>
                </input>
                {props.coverPhotoKey || useCoverPhoto ? (
                    <button onClick={clearFile}>
                        {shouldRemoveSavedCoverPhoto ?
                            "Keep Saved Cover Photo" :
                            "Remove Existing Cover Photo"
                        }
                    </button>)
                    : null}
            </div>)


        }
        else {
            throw new Error("No Post Types Matched for Cover Photo Controls");
        }
    }

    const handleSuccess = () => {
        alert("Post Successful! You will see your post soon.");
        props.closeModal();
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
            throw new Error("No value matched for return click.");
        }
    }


    const postTypeTitle = props.postType === SHORT ? (
        <div>
            <h2>Add your metadata!</h2>
            <p>Optional of course</p>
        </div>
    )
        :
        (<div>
            <h2>Add your metadata!</h2>
            <p>Optional of course</p>
        </div>);

    const optionalLongPostDescription = props.postType === LONG ? (
        <TextareaAutosize
            name="subtitle"
            id='review-post-text'
            placeholder='Create an Optional Description'
            onChange={(e) => setSubtitle(e.target.value)}
            maxLength={140} />)
        :
        (null);

    pursuitSelects.push(
        <option value={null}></option>
    )
    for (let i = 1; i < props.pursuitNames.length; i++) {
        const pursuit = props.pursuitNames[i];
        pursuitSelects.push(
            <option key={pursuit} value={pursuit}>{pursuit}</option>
        );
    }
    return (
        <div id="reviewpost-small-window">
            <div>
                <div>
                    {postTypeTitle}
                    <div>
                        <span >
                            <button
                                value={props.previousState}
                                onClick={e => handleReturnClick(e.target.value)}
                            >
                                Return
                            </button>
                        </span>
                    </div>
                </div>
                <div className="reviewpost-button-container">
                    <label>Preview Title</label>
                    <TextareaAutosize
                        name="title"
                        placeholder='Create an Optional Preview Title Text'
                        value={title ? title : null}
                        onChange={(e) => setTitle(e.target.value)} maxLength={100}
                    />
                    {optionalLongPostDescription}
                    {renderCoverPhotoControl()}
                    <label>Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    ></input>
                    <label>Pursuit</label>
                    <select
                        name="pursuit-category"
                        value={pursuit}
                        onChange={(e) => setPursuit(e.target.value)}
                    >
                        {pursuitSelects}
                    </select>
                    <label>Total Minutes</label>
                    <input
                        type="number"
                        value={props.min}
                        min={0}
                        onChange={(e) => setMinDuration(e.target.value)}>
                    </input>
                    <label>Difficulty</label>
                    <p>{displayDifficulty(difficulty)}</p>
                    <input
                        defaultValue={difficulty}
                        type="range"
                        step={1}
                        min={0}
                        max={2}
                        onClick={(e) => setDifficulty(e.target.value)}>
                    </input>
                    <label>Progress</label>
                    <p>{displayProgressionType(progression)}</p>
                    <input
                        defaultValue={progression}
                        type="range"
                        step={1}
                        min={0}
                        max={2}
                        onClick={(e) => setProgression(e.target.value)}>
                    </input>
                </div>
                <div>
                    <label>Tags</label>
                    <CustomMultiSelect
                        clearOptions={true}
                        name={"Tags"}
                        onSelect={setLabels}
                    />

                </div>
                <div className="reviewpost-button-container">
                    <p>Post to:</p>
                    <div>
                        <select
                            name="posts"
                            id="postPrivacyType"
                            value={props.preferredPostPrivacy ?
                                props.preferredPostPrivacy : PUBLIC_FEED}
                            onChange={(e) => setPostPrivacyType(e.target.value)}
                        >
                            <option value={PRIVATE}>
                                Make post private on your page
                            </option>
                            <option value={PERSONAL_PAGE}>
                                Make post public on your page:
                            </option>
                            <option value={PUBLIC_FEED}>
                                Post to your feed and page
                            </option>
                        </select>
                    </div>
                    <button onClick={(e) => handleFormAppend(e)} disabled={isSubmitting}>
                        {props.isUpdateToPost ?
                            isSubmitting ? "Updating!" : "Update!" :
                            isSubmitting ? "Posting!" : "Post!"}
                    </button>
                </div>
                {error ? <p>An Error Occured. Please try again. </p> : <></>}
                {loading ? <div>  <p> Loading...</p>  </div> : <></>}
            </div>
        </div>
    );
}

export default ReviewPost;