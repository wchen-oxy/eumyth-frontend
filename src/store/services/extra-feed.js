import { CACHED, DYNAMIC, POST, USER } from "utils/constants/flags";

// export const setSimilarPeopleAdvanced = (results, usedPeople) => {
//     console.log(results);

//     const beginner = similar.beginner;
//     const familiar = similar.familiar;
//     const experienced = similar.experienced;
//     const expert = similar.expert;
//     for (const name in similar) {
//         const IDs = similar[name].map(item => item._id);
//         usedPeople = usedPeople.concat(IDs);
//     }
//     usedPeople = [...new Set(usedPeople)];

//     return {
//         usedPeople,
//         dynamic: {
//             beginner,
//             familiar,
//             experienced,
//             expert
//         }
//     }
// };

export const getDynamicType = (index) => {
    switch (index) {
        case (0): //beginner
            return "beginner";
        case (1): //familiar
            return "familiar";
        case (2): //experienced
            return "experienced";
        case (3): //expert
            return "expert";
        default:
            throw new Error("Unmatched UNCACHED Type");
    }

}

export const getCachedType = (index) => {
    switch (index) {
        // case (0): //following
        //     return "following";
        case (0): //parents
            return "parents";
        case (1): //siblings
            return "siblings";
        case (2): //children
            return "children";
        default:
            throw new Error("Unmatched Cached Type");

    }
}

export const _formatContent = (feed, category, index, isCached) => {
    if (isCached) {
        const type = getCachedType(category);
        const content = feed[type][index];
        return {
            type: POST,
            content: content
        }
    }
    else {
        const type = getDynamicType(category);
        const content = feed[type][index];
        return {
            type: USER,
            content: content
        }
    }
}

export const initializeContent = (
    cachedTypeIndex,
    cachedItemIndex,
    dynamicTypeIndex,
    dynamicItemIndex,
    cached,
    dynamic,
    contentList,
    usedPeople
) => {
    let isCachedToggled = true;
    let count = 0;
    console.log(dynamic);
    while (cachedTypeIndex < 3 && dynamicTypeIndex < 4) {
        if (count > 100) throw new Error();
        if (isCachedToggled) {
            const formatted =
                _formatContent(
                    cached,
                    cachedTypeIndex,
                    cachedItemIndex,
                    isCachedToggled
                );
            isCachedToggled = !isCachedToggled;
            if (formatted.content === undefined) {
                cachedItemIndex = 0;
                cachedTypeIndex++;
                continue;
            }
            contentList.push(formatted);
            cachedItemIndex++;
        }
        else {
            const formatted =
                _formatContent(
                    dynamic,
                    dynamicTypeIndex,
                    dynamicItemIndex,
                    isCachedToggled
                );
            isCachedToggled = !isCachedToggled;
            if (formatted.content === undefined) {
                dynamicItemIndex = 0;
                dynamicTypeIndex++;
                continue;
            }
            console.log(formatted);
            contentList.push(formatted);
            usedPeople.push(formatted.content._id)
            dynamicItemIndex++;
        }
    }
    return {
        cachedItemIndex,
        cachedTypeIndex,
        dynamicItemIndex,
        dynamicTypeIndex
    }
}

export const renderedContent = () => {

}

export const addRemainingContent = (
    feedType, //static or uncached
    feedCategoryIndex,
    feedItemIndex,
    feeds,
    contentList
) => {
    let getter = null;
    let max = null;
    let type = null;
    if (feedType === DYNAMIC) {
        getter = getDynamicType;
        max = 4;
        type = USER;
    }
    if (feedType === CACHED) {
        getter = getCachedType;
        max = 3;
        type = POST; //THIS IS APPENDING THE TYPE TO CACHED AND IT SHOULD BE USER? 
    }

    while (feedCategoryIndex < max) {
        let category = getter(feedCategoryIndex);
        const contentCategory = feeds[category]; // sections types
        for (let i = feedItemIndex; i < contentCategory.length; i++) {
            contentList.push({
                type: type,
                content: contentCategory[i]
            });
        }
        feedCategoryIndex++;
    }
}