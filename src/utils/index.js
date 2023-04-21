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
    return feedData;
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
    // console.log(exisitingArray, inputArray)
    console.log(contentType);

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

export const getDistance = (lon1, lon2, lat1, lat2) => {
    // The math module contains a function
    // named toRadians which converts from
    // degrees to radians.
    lon1 = lon1 * Math.PI / 180;
    lon2 = lon2 * Math.PI / 180;
    lat1 = lat1 * Math.PI / 180;
    lat2 = lat2 * Math.PI / 180;

    // Haversine formula
    let dlon = lon2 - lon1;
    let dlat = lat2 - lat1;
    let a = Math.pow(Math.sin(dlat / 2), 2)
        + Math.cos(lat1) * Math.cos(lat2)
        * Math.pow(Math.sin(dlon / 2), 2);

    let c = 2 * Math.asin(Math.sqrt(a));

    // Radius of earth in kilometers. Use 3956
    // for miles
    //use 6371 for km
    let r = 3956;

    // calculate the result
    return (c * r);
}