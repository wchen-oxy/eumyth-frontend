import imageCompression from 'browser-image-compression';

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

export const formatReactSelectOptions = (data) => data.map((value) => ({ label: value, value: value }));

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
