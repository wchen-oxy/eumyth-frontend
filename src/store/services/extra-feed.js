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

export const _formatContent = (feed, meta, isCached) => {
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
            post,
        }
    }
}


export const convertPursuitToQueue = (pursuit) => {
    let i = 0;
    let queue = [];
    while (pursuit.exact[i] && pursuit.different[i]) {
        queue.push(pursuit.exact[i]);
        queue.push(pursuit.different[i]);
    }
    if (i < pursuit.exact.length) {
        queue = queue.concat(pursuit.exact.slice(i, pursuit.exact.length));
    }
    if (i < pursuit.different.length) {
        queue = queue.concat(pursuit.different.slice(i, pursuit.different.length));
    }
    return { type: pursuit.type, queue };
}

export const initializeContent = (
    cachedTypeIndex,
    cachedItemIndex,
    numOfPursuits,
    cached,
    dynamic,
    contentList,
    usedPeople
) => {
    let isCachedToggled = true;
    let pursuitIndex = 0;
    let count = 0;
    // add a queue
    while (cachedTypeIndex < 3 && pursuitIndex < numOfPursuits) {
        if (count > 100) throw new Error();
        if (isCachedToggled) {
            const type = getCachedType(cachedTypeIndex);
            const content = cached[type][cachedItemIndex];
            const formatted = {
                type: POST,
                content: content
            }
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
            if (dynamic[pursuitIndex].length === 0) {
                pursuitIndex++;
                continue;
            }
            const user = dynamic[pursuitIndex].shift();
            contentList.push({ type: USER, content: user });
            usedPeople.push(user._id)

        }
    }
    return {
        cachedItemIndex,
        cachedTypeIndex
    }
}


export const extractContentFromRaw = (
    cached,
    dynamic,
    contentList,
    usedPeople
) => {
    let cachedTypeIndex = 0; //max is 4
    let cachedItemIndex = 0;
    let pursuitIndex = 0;
    let isCachedToggled = true;
    let count = 0;
    const numOfPursuits = dynamic.length;

    while (cachedTypeIndex < 3 && pursuitIndex < numOfPursuits) {
        if (count > 100) throw new Error();
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
            if (dynamic[pursuitIndex].queue.length === 0) {
                pursuitIndex++;
            }
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
        const type = feed[meta.pursuitIndex].type;
        const content = feed[meta.pursuitIndex].queue.shift();
        const index = content.matched_pursuit_index =
            content.pursuits.findIndex((item) => item.name === type);
        const formatted = {
            type: USER,
            content: content,
            post: content.pursuits[index].posts[0]
        };
        contentList.push(formatted);
        usedPeople.push(formatted.content._id);
    }
}