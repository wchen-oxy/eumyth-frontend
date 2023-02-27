import imageCompression from 'browser-image-compression';
import { CACHED, POST, PROJECT, UNCACHED } from './constants/flags';

export const updateProjectPreviewMap = (projectPreviewMap, projectPreview) => {
        let newMap = projectPreviewMap;
        newMap[projectPreview._id] = projectPreview;
        return newMap;
}

export const alterRawCommentArray = (itemIndex, newCommentArray, feedData) => {
    feedData[itemIndex].comments = newCommentArray;
    feedData[itemIndex].comment_count += 1;
    return { feedData }
}

export const toTitleCase = (str) => {
    return str.replace(
        /\w\S*/g,
        function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}

export const sortTimelineContent = (exisitingArray, inputArray, contentType, objectIDs) => {
    let feedData = [];
    if (contentType === UNCACHED) {
        feedData = exisitingArray
            .concat(
                inputArray);
    }
    else if (contentType === CACHED) {
        feedData = exisitingArray
            .concat(
                inputArray
                    .sort((a, b) =>
                        objectIDs.indexOf(a._id) - objectIDs.indexOf(b._id))
            );
    }
    return feedData;
}

export const formatPostText = (eventData) => {
    return eventData?.text_data && eventData.is_paginated ?
        JSON.parse(eventData.text_data) : eventData.text_data;
};

export const createPursuitArray = (pursuits) => {
    let pursuitNameArray = [];
    let projectArray = [];
    for (const pursuit of pursuits) {
        pursuitNameArray.push(pursuit.name);
        if (pursuit.projects) {
            for (const project of pursuit.projects) {
                projectArray.push(project);
            }
        }
    }
    return {
        names: pursuitNameArray,
        projects: projectArray
    }
};

export const formatReactSelectOptions =
    (data) => data.map((option) => ({ label: option, value: option }));

export const setFile = (file, setPhotoBoolean, setPhoto, maxWidthOrHeight, filename) => {
    if (!file) return;
    setPhotoBoolean(true);
    return imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: maxWidthOrHeight
    })
        .then((result) => {
            setPhoto(new File([result], filename));
            return true;
        })
        .catch((err) => {
            console.log(err);
            return false;
        })
}
