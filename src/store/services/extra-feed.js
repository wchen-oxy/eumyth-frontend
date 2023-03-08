import { CACHED, DYNAMIC, POST, USER } from "utils/constants/flags";


export const getDynamicType = (index) => {
    switch (index) {
        case (0): //beginner
            return "EXACT";
        case (1): //familiar
            return "DIFFERENT";
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

const _formatContent = (feed, meta, isCached) => {
    if (isCached) {
        const type = getCachedType(meta.cachedTypeIndex);
        const content = feed[type][meta.cachedItemIndex];
        return {
            type: POST,
            post: content
        }
    }
    else {
        const pursuit = feed[meta.pursuitIndex].type;
        let content = feed[meta.pursuitIndex].queue.shift();
        const index = content.matched_pursuit_index =
            content.pursuits.findIndex((item) => item.name === pursuit);
        const posts = content.pursuits[index].posts;
        const post = posts.length > 0 ? posts[0] : null;


        return {
            type: USER,
            content: content,
            data: null,
            post: post,
        }
    }
}


export const convertPursuitToQueue = (pursuit) => {
    let i = 0;
    let queue = [];
    while (pursuit.exact[i] && pursuit.different[i]) {
        queue.push(pursuit.exact[i]);
        queue.push(pursuit.different[i]);
        i++;
    }
    let k = i;
    let j = i;

    while (j < pursuit.exact.length) {
        queue.push(pursuit.exact[j++]);
    }

    while (k < pursuit.different.length) {
        queue.push(pursuit.exact[k++]);
    }
    return { type: pursuit.type, queue: queue };
}

export const extractContentFromRaw = (
    cached,
    dynamic,
    contentList,
    usedPeople,
    dictionary
) => {
    let cachedTypeIndex = 0; //max is 4
    let cachedItemIndex = 0;
    let pursuitIndex = 0;
    let isCachedToggled = true;
    let count = 0;
    const numOfPursuits = dynamic.length;

    while (cachedTypeIndex < 3 && pursuitIndex < numOfPursuits) {
        //add catches for null items
        if (count > 100) throw new Error();
        count++;
        if (isCachedToggled) {
            const formatted =
                _formatContent(
                    cached,
                    {
                        cachedTypeIndex,
                        cachedItemIndex
                    },
                    isCachedToggled
                );
            isCachedToggled = !isCachedToggled;
            if (formatted.post === undefined) {
                cachedItemIndex = 0;
                cachedTypeIndex++;
                continue;
            }
            contentList.push(formatted);
            cachedItemIndex++;
        }
        else {
            if (dynamic[pursuitIndex].queue.length === 0) {
                pursuitIndex++;
                continue;
            }
            const formatted =
                //get item from queue and put into formatter
                _formatContent(
                    dynamic,
                    {
                        pursuitIndex,
                        numOfPursuits
                    },
                    isCachedToggled
                );
            isCachedToggled = !isCachedToggled;
            contentList.push(formatted);
            usedPeople.push(formatted.content._id)
        }
    }
    return {
        cachedItemIndex,
        cachedTypeIndex,
        pursuitIndex
    }
}


export const addRemainingCachedContent = (
    feedCategoryIndex,
    feedItemIndex,
    feeds,
    contentList,
) => {
    while (feedCategoryIndex < 3) {
        let category = getCachedType(feedCategoryIndex);
        const contentCategory = feeds[category];
        for (let i = feedItemIndex; i < contentCategory.length; i++) {
            contentList.push({
                type: POST,
                post: contentCategory[i]
            });
        }
        feedCategoryIndex++;
    }
}

export const addRemainingDynamicContent = (meta, feed, contentList, usedPeople) => {
    while (meta.pursuitIndex < meta.numOfPursuits) {
        if (feed[meta.pursuitIndex].queue.length === 0) {
            meta.pursuitIndex++;
            continue;
        }
        const formatted =
            //get item from queue and put into formatter
            _formatContent(
                feed,
                {
                    pursuitIndex: meta.pursuitIndex,
                    numOfPursuits: meta.numOfPursuits
                },
                false
            );
        contentList.push(formatted);
        usedPeople.push(formatted.content._id)
    }
}