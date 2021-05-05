import React, { useState } from 'react';
import _ from 'lodash';
import TextareaAutosize from 'react-textarea-autosize';
import { PUBLIC_FEED, PERSONAL_PAGE, PRIVATE, SHORT, LONG } from "../../constants/flags";
import imageCompression from 'browser-image-compression';
import "./review-post.scss";
import AxiosHelper from '../../../Axios/axios';
import {
    COVER_PHOTO_FIELD,
    DATE_FIELD,
    DISPLAY_PHOTO_FIELD,
    IMAGES_FIELD,
    IS_MILESTONE_FIELD,
    IS_PAGINATED_FIELD,
    MIN_DURATION_FIELD,
    POST_ID_FIELD,
    POST_PRIVACY_TYPE_FIELD,
    POST_TYPE_FIELD,
    PURSUIT_CATEGORY_FIELD,
    REMOVE_COVER_PHOTO,
    SUBTITLE_FIELD,
    TEXT_DATA_FIELD,
    TITLE_FIELD,
    USERNAME_FIELD
} from "../../constants/form-data";

const ReviewPost = (props) => {
    const [date, setDate] = useState(props.date);
    const [minDuration, setMinDuration] = useState(null);
    const [milestone, setMilestone] = useState(props.isMilestone);
    const [title, setTitle] = useState(props.previewTitle);
    const [subtitle, setSubtitle] = useState('');
    const [postPrivacyType, setPostPrivacyType] = useState(props.preferredPostType);
    const [pursuitCategory, setPursuitCategory] = useState(
        props.selectedPursuit ? props.selectedPursuit : null)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [coverPhoto, setCoverPhoto] = useState(null);
    const [useCoverPhoto, setUseCoverPhoto] = useState(props.coverPhotoKey !== null && props.isUpdateToPost);
    const [useImageForThumbnail, setUseImageForThumbnail] = useState(props.coverPhotoKey);
    const [shouldRemoveSavedCoverPhoto, setShouldRemoveSavedCoverPhoto] = useState(false);
    const [randomKey, setRandomKey] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
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
        console.log(file);
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
                formData.append(POST_ID_FIELD, props.postId);
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
                        .then(() => {
                            formData.append(REMOVE_COVER_PHOTO, true);
                            return handleUpdateSubmit(formData)
                        });
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
                formData.append(POST_ID_FIELD, props.postId);
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
                            .then(() => {
                                formData.append(REMOVE_COVER_PHOTO, true);
                                return handleUpdateSubmit(formData)
                            });
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
        else{
            throw new Error("No Content Type matched in reviewpost")
        }

    }

    const handleUpdateSubmit = (formData) => {
        for (var value of formData.entries()) {
            console.log(value[0], ",", value[1]);
        }
        return AxiosHelper.updatePost(formData)
            .then((result) => {
                console.log(result);
                setIsSubmitting(false);
                //     result.status === 200 ? handleSuccess() : handleError();
            }).catch((result) => {
                console.log(result.error);
                setIsSubmitting(false);
                alert(result);
            });
    }

    const handleFormAppend = () => {
        setIsSubmitting(true);
        let formData = new FormData();
        formData.append(DISPLAY_PHOTO_FIELD, props.displayPhoto);
        formData.append(POST_TYPE_FIELD, props.postType);
        formData.append(USERNAME_FIELD, props.username);
        formData.append(IS_PAGINATED_FIELD, props.isPaginated);
        formData.append(IS_MILESTONE_FIELD, milestone ? milestone : false)
        if (title) formData.append(TITLE_FIELD, _.trim(title));
        if (postPrivacyType) formData.append(POST_PRIVACY_TYPE_FIELD, postPrivacyType);
        if (pursuitCategory) formData.append(PURSUIT_CATEGORY_FIELD, pursuitCategory);
        if (date) formData.append(DATE_FIELD, date);
        if (minDuration) formData.append(MIN_DURATION_FIELD, minDuration);
        if (subtitle) {
            formData.append(SUBTITLE_FIELD, _.trim(subtitle));
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
    for (const pursuit of props.pursuitNames) {
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
                        value={pursuitCategory}
                        onChange={(e) => setPursuitCategory(e.target.value)}
                    >
                        {pursuitSelects}
                    </select>
                    <label>Total Minutes</label>
                    <input
                        type="number"
                        value={props.min}
                        onChange={(e) => setMinDuration(e.target.value)}>
                    </input>
                    <label>Is Milestone</label>
                    <input
                        type="checkbox"
                        value={milestone}
                        onClick={() => setMilestone(!milestone)}>
                    </input>
                </div>
                <div className="reviewpost-button-container">
                    <p>Post to:</p>
                    <div>
                        <select
                            name="posts"
                            id="cars"
                            value={props.preferredPostType ?
                                props.preferredPostType : PUBLIC_FEED}
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