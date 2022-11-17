export const draft = {
    //editors
    imageIndex: 0,

    //initial
    postDisabled: true,
    //shortpost meta

    labels: null,
    //review stage
    // loading: false, //maybe
    // error: false, //maybe
    threadToggleState: false,
    titlePrivacy: false,
    threadTitle: '',
    isCompleteProject: false,
    selectedDraft: null
}

export const distanceSwitch = (distance) => {
    switch (distance) {
        case (undefined):
            return 50;
        case (50):
            return 100;
        case (100):
            return 200;
        default:
            return 1000;
    }
}