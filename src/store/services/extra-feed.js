import { CACHED, DYNAMIC } from "utils/constants/flags";

export const setSimilarPeopleAdvanced = (results, usedPeople) => {
    const similar = results.data;
    const beginner = similar.beginner;
    const familiar = similar.familiar;
    const experienced = similar.experienced;
    const expert = similar.expert;
    for (const name in similar) {
        const IDs = similar[name].map(item => item._id);
        usedPeople = usedPeople.concat(IDs);
    }
    usedPeople = [...new Set(usedPeople)];

    return {
        usedPeople,
        beginner,
        familiar,
        experienced,
        expert
    }
};

export const getDynamicType = (index) => {
    console.log(index);
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
        case (0): //following
            return "following";
        case (1): //parents
            return "parents";
        case (2): //siblings
            return "siblings";
        case (3): //children
            return "children";
        default:
            throw new Error("Unmatched Cached Type");

    }
}

export const initializeContent = (
    cachedTypeIndex,
    cachedItemIndex,
    dynamicTypeIndex,
    dynamicItemIndex,
    cached,
    dynamic,
    postIDList
) => {
    let isCachedToggled = true;
    while (cachedTypeIndex < 4 && dynamicTypeIndex < 4) {
        if (isCachedToggled) {
            let type = getCachedType(cachedTypeIndex);
            const content = cached[type][cachedItemIndex];
            isCachedToggled = !isCachedToggled;
            if (content === undefined) {
                cachedItemIndex = 0;
                cachedTypeIndex++;
                continue;
            }
            postIDList.push(content);
            cachedItemIndex++;
        }
        else {
            let type = getDynamicType(dynamicTypeIndex);
            const content = dynamic[type][dynamicItemIndex];
            isCachedToggled = !isCachedToggled;
            if (content === undefined) {
                dynamicItemIndex = 0;
                dynamicTypeIndex++;
                continue;
            }
            postIDList.push(content)
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

const renderPost = () => {

}

export const addRemainingContent = (
    feedType, //static or uncached
    feedCategoryIndex,
    feedItemIndex,
    feeds,
    postIDList
) => {
    let getter = null;
    if (feedType === DYNAMIC) getter = getDynamicType;
    if (feedType === CACHED) getter = getCachedType;
    while (feedCategoryIndex < 4) {
        let type = getter(feedCategoryIndex);
        const contentCategory = feeds[type]; // sections types
        console.log()
        for (let i = feedItemIndex; i < contentCategory.length; i++) {
            postIDList.push(contentCategory[i]);
        }
        feedCategoryIndex++;
    }

}