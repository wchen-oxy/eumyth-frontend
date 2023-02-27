export const checkInputNotNull = (data, func) => data ? func(data) : null;
export const validateFeedIDs = (IDList) => {
    if (IDList.length > 0 && IDList.every(i => (typeof i !== 'string'))) {
        throw new Error('Feed is not just ObjectIDs');
    }
}
export const checkPostFunctionsExist = (functions, isPostOnlyView) => {
    if (!isPostOnlyView) {
        const isMissingFunctions =
            !functions.saveProjectPreview
            || !functions.setModal
            || !functions.onCommentIDInjection
            || !functions.saveProjectPreview;
        if (isMissingFunctions) {
            throw new Error("Missing Modal and Comment Functions");
        }
    }
}