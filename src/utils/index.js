import imageCompression from 'browser-image-compression';

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

export const setFile = (file, setPhotoBoolean, setPhoto) => {
    if (!file) return;
    setPhotoBoolean(true);
    return imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1000
    })
        .then((result) => {
            setPhoto(new File([result], 'Cover'))
        })
}
