export const checkInputNotNull = (data, func) => data ? func(data) : null;
export const validateFeedIDs = (IDList) => {
    if (IDList.length > 0 && IDList.every(i => (typeof i !== 'string'))) {
        throw new Error('Feed is not just ObjectIDs');
    }
}