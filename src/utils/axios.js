import axios from 'axios';
import { COVER, POST, PROJECT } from 'utils/constants/flags';
import { returnUsernameObject } from 'utils/url';
import urls from 'utils/constants/urls';


export default class AxiosHelper {

    static allPosts(profileID) {
        return axios.get(urls.ALL_POSTS, {
            params: {
                profileID: profileID
            }
        })
    }

    static changeRelationStatus(action, targetUserPreviewID, targetUserRelationID, currentUserRelationID) {
        return axios.put(urls.RELATION_SET_FOLLOWER_URL, {
            action: action,
            targetUserPreviewID: targetUserPreviewID,
            targetUserRelationID: targetUserRelationID,
            currentUserRelationID: currentUserRelationID
        })
    }

    static checkUsernameAvailable(username) {
        return axios.get(urls.CHECK_USERNAME_URL, {
            username: username
        });
    }

    static createPost(postInfoForm) {
        return axios.post(urls.POST_BASE_URL, postInfoForm);
    }

    static createProject(projectInfo) {
        return axios.post(urls.PROJECT_BASE_URL, projectInfo)
    }

    static updateProject(projectInfo) {
        return axios.put(urls.PROJECT_BASE_URL, projectInfo);
    }

    static updateCachedDraftTitle(indexUserID, projectID, threadTitle) {
        return axios.put(urls.DRAFT_TITLE_URL, {
            indexUserID,
            projectID,
            threadTitle
        })
    }

    static updatePostOwner(projectPreviewID, projectID, postID) {
        return axios.put(urls.PROJECT_THREAD_URL, {
            projectPreviewID,
            projectID,
            postID
        })
    }

    static createUserProfile(formData) {
        return axios.post(urls.USER_BASE_URL, formData);
    }

    static deleteAccountPhoto(username, photoType) {
        return axios.delete(photoType === COVER ? urls.COVER_PHOTO_URL : urls.DISPLAY_PHOTO_URL, {
            data: {
                username: username,
                contentType: photoType
            }
        })
    }

    static deletePhotoByKey(imageKey) {
        return axios.delete(urls.IMAGE_BASE_URL, {
            data: {
                imageKey: imageKey
            }
        })
    }

    static deleteManyPhotosByKey(keysArray) {
        return axios.delete(urls.MULTIPLE_IMAGES_URL, {
            data: { keys: keysArray }
        });
    }

    static deleteProject(
        projectID,
        shouldDeletePosts,
        indexUserID,
        userID,
        userPreviewID) {
        return axios.delete(urls.PROJECT_BASE_URL, {
            params: {
                projectID,
                shouldDeletePosts,
                indexUserID,
                userID,
                userPreviewID
            }
        })
    }

    static deletePost(userPreviewID, userID, indexUserID, postID, pursuit, duration, progression) {
        return axios.delete(urls.POST_BASE_URL, {
            data: {
                userPreviewID,
                userID,
                indexUserID,
                postID,
                pursuit,
                duration
            }
        });
    }

    static getCachedFeed(cachedFeedsID) {
        return axios.get(urls.CACHED_FEED_URL, {
            params: {
                cachedFeedsID
            }
        })
    }

    static getUserPreviewID(username) {
        return axios.get(urls.USER_PREVIEW_ID_URL, returnUsernameObject(username));
    }

    static getSimilarPeople(distance, pursuit, userPreviewIDList, latitude, longitude) {
        return axios.get(urls.SIMPLE_PEOPLE_URL,
            { params: { distance, pursuit, userPreviewIDList, latitude, longitude } })
    }

    static getSimilarPeopleAdvanced(distance, pursuits, userPreviewIDList, latitude, longitude) {
        return axios.get(urls.ADVANCED_PEOPLE_URL,
            { params: { distance, pursuits, userPreviewIDList, latitude, longitude } })
    }

    static getSpotlight(distance, latitude, longitude, userPreviewIDList) {
        return axios.get(urls.SPOTLIGHT_URL, { params: { distance, latitude, longitude, userPreviewIDList } });
    }

    static returnUserRelationInfo(username) {
        return axios.get(urls.RELATION_INFO_URL, returnUsernameObject(username));
    }

    static returnTinyDisplayPhoto(username) {
        return axios.get(urls.TINY_DISPLAY_PHOTO_URL, returnUsernameObject(username))
    }

    static setProfilePrivacy(username, isPrivate) {
        return axios.put(urls.USER_PRIVACY_URL, {
            username: username,
            isPrivate: isPrivate
        });
    }

    static setFollowerStatus(
        visitorUserRelationID,
        visitorCachedFeedID,
        targetUserRelationID,
        targetCachedFeedID,
        action,
        isPrivate
    ) {
        return axios.put(urls.RELATION_STATUS_URL,
            {
                visitorUserRelationID,
                visitorCachedFeedID,
                targetUserRelationID,
                targetCachedFeedID,
                action,
                isPrivate
            }
        );
    }

    static createFork(
        userID,
        indexUserID,
        username,
        projectData,
        shouldCopyPosts,
        displayPhotoKey,
        title,
        remix,
        cachedFeedID,
        pursuit
    ) {
        return axios.put(urls.PROJECT_FORK_URL, {
            userID,
            indexUserID,
            username,
            projectData,
            shouldCopyPosts,
            displayPhotoKey,
            title,
            remix,
            cachedFeedID,
            pursuit
        })
    }

    static getLocation(userPreviewID) {
        return axios.get(urls.USER_PREVIEW_LOCATION_URL, { params: { userPreviewID: userPreviewID } });
    }

    static setLocation(latitude, longitude, userPreviewID) {
        return axios.put(urls.USER_PREVIEW_LOCATION_URL, { latitude, longitude, userPreviewID });
    }
    // static setDraftPreviewTitle(previewTitle) {
    //     return axios.post(urls.DRAFT_BASE_URL, { previewTitle: previewTitle });
    // }

    // static returnPursuitNames(username) {
    //     return axios.get(urls.INDEX_USER_PURSUITS_URL, returnUsernameObject(username));
    // }

    static returnIndexUser(username, isTruncated) {
        return axios.get(urls.INDEX_BASE_URL, {
            params: {
                username: username,
                isTruncated: isTruncated
            }
        })
    }

    static returnUser(username) {
        return axios.get(urls.USER_BASE_URL, returnUsernameObject(username));
    }

    static returnFollowerStatus(visitorUsername, userRelationID) {
        return axios.get(urls.RELATION_BASE_URL, {
            params: {
                visitorUsername: visitorUsername,
                userRelationID: userRelationID,
            }
        })
    }

    static getSpotlightProjects(quantity, pursuitArray) {
        return axios.get(urls.PROJECT_SPOTLIGHT_URL, {
            params: { quantity, pursuitArray }
        })
    }

    static returnSingleProject(projectID) {
        return axios.get(urls.SINGLE_PROJECT_URL, {
            params: {
                projectID: projectID
            }
        })
    }

    static returnMultipleProjects(projectIDList) {
        return axios.get(urls.MULTIPLE_PROJECTS_URL, {
            params: {
                projectIDList: projectIDList
            }
        })
    }

    static getSingleProjectPreview(id) {
        return axios.get(urls.PROJECT_PREVIEW_SINGLE_URL, {
            params: {
                projectPreviewID: id
            }
        })
    }

    static getRelatedProjectPreview(excluded, keywords, pursuit) {
        return axios.get(urls.SEARCH_RELATED_PREVIEW_URL, {
            params: {
                excluded, keywords, pursuit
            }
        })
    }

    static getSharedParentProjectPreview(parentProjectID, status, excluded) {
        return axios.get(urls.PROJECT_PREVIEW_SHARED_URL, {
            params: {
                parentProjectID,
                status,
                excluded
            }
        })
    }

    static returnMultiplePostInfo(targetUserDataID, postIDList) {
        return axios.get(urls.MULTIPLE_POSTS_URL, {
            params: {
                targetUserDataID: targetUserDataID,
                postIDList: postIDList
            }
        })
    }
    static returnProjectPreviewFromPostID(postID) {
        return axios.get(urls.PROJECT_PREVIEW_FROM_POST, {
            params: { postID }
        })
    }
    static returnMultiplePosts(postIDList, includePostText) {
        return axios.get(urls.MULTIPLE_POSTS_URL, {
            params: {
                postIDList: postIDList,
                includePostText: includePostText
            }
        })
    }

    static returnExtraFeedContent(contentList) {
        return axios.get(urls.EXTRA_FEED_URL, {
            params: {
                contentList
            }
        })
    }

    static returnOverflowContent(pursuit, contentIDList, contentType, userID, requestQuantity) {
        console.log(pursuit);
        return axios.get(urls.SEARCH_UNCACHED_URL, {
            params: {
                pursuit,
                contentIDList,
                contentType,
                userID,
                requestQuantity
            }
        })
    }
    static retrieveProject(projectID) {
        return axios.get(urls.PROJECT_BASE_URL, {
            params: {
                projectID: projectID
            }
        })
    }

    static retrievePost(postID, textOnly) {
        return axios.get(urls.SINGLE_POST_TEXT_DATA_URL, {
            params: {
                postID: postID,
                textOnly: textOnly
            }
        })
    }

    static returnSocialFeedPosts(indexUserID, postIDList) {
        return axios.get(urls.SOCIAL_FEED_POSTS_URL, {
            params: {
                indexUserID: indexUserID,
                postIDList: postIDList

            }
        })
    }

    static returnAccountSettingsInfo(username) {
        return axios.get(urls.USER_ACCOUNT_SETTINGS_INFO_URL, returnUsernameObject(username))
    }

    static updateBio(userPreviewID, indexUserID, userID, bio) {
        return axios.put(urls.USER_BIO_URL, {
            userPreviewID, indexUserID, userID, bio
        });
    }

    static updatePost(postInfoForm) {
        return axios.put(urls.POST_BASE_URL, postInfoForm);
    }

    static updateAccountImage(formData, photoType) {
        return axios.post(photoType === 'COVER' ? urls.COVER_PHOTO_URL : urls.DISPLAY_PHOTO_URL, formData)
    }

    static getComments(rootCommentIDArray, viewingMode) {
        return axios.get(urls.COMMENT_BASE_URL, {
            params: {
                rootCommentIDArray,
                viewingMode: viewingMode
            }
        })
    }
    static postComment(profilePreviewID, comment, postID, imagePageNumber) {
        return axios.post(urls.ROOT_COMMENT_URL, {
            profilePreviewID: profilePreviewID,
            comment: comment,
            postID: postID,
            imagePageNumber: imagePageNumber
        });
    }
    static postAnnotation(
        profilePreviewID,
        postID,
        imagePageNumber,
        annotationData,
        annotationGeometry) {
        return axios.post(urls.ROOT_COMMENT_URL, {
            profilePreviewID: profilePreviewID,
            postID: postID,
            imagePageNumber: imagePageNumber,
            annotationData: annotationData,
            annotationGeometry: annotationGeometry
        });
    }
    static postReply(postID, profilePreviewID, ancestors, comment) {
        return axios.post(urls.REPLY_COMMENT_URL, {
            postID: postID,
            profilePreviewID: profilePreviewID,
            ancestors: ancestors,
            comment: comment,
        });
    }

    static publishProject(projectID) {
        return axios.put(urls.PROJECT_PUBLISH_URL, {
            projectID: projectID
        })
    }

    static retrieveNewPostInfo(username) {
        return axios.get(urls.DRAFT_BASE_URL, returnUsernameObject(username))
    }

    static returnImage(imageKey) {
        return axios
            .get(urls.IMAGE_BASE_URL, { params: { imageKey: imageKey } })
    }

    static refreshComments(rootCommentIDArray) {
        return axios.get(urls.REFRESH_COMMENTS_URL, {
            params: {
                rootCommentIDArray: rootCommentIDArray
            }
        });
    }

    static saveDraft(username, draft, draftTitle) {
        return axios.put(urls.DRAFT_BASE_URL,
            {
                username: username,
                draft: JSON.stringify(draft),
                draftTitle: draftTitle
            }
        )
    }

    // static saveDraftMetaInfo(metaInfoForm) {
    //     return axios.put(urls.DRAFT_BASE_URL, metaInfoForm)
    // }

    static updatePostDisplayPhotos(username, imageKey) {
        return axios.patch(urls.POST_DISPLAY_PHOTO_URL, {
            username: username,
            imageKey: imageKey
        });
    }
    static updateTemplate(indexUserID, text, pursuit) {
        return axios.put(urls.USER_TEMPLATE_URL, {
            indexUserID: indexUserID,
            text: text,
            pursuit: pursuit
        });
    }

    static voteOnComment(profilePreviewID, commentID, voteValue) {
        return axios.put(urls.VOTE_ON_COMMENT_URL, {
            profilePreviewID: profilePreviewID,
            commentID: commentID,
            voteValue: voteValue,
        });
    }
    static voteOnProject(projectID, userPreviewID, voteValue) {
        return axios.put(urls.PROJECT_VOTE_URL, {
            projectID,
            userPreviewID,
            voteValue
        })
    }

    static bookmarkContent(contentType, contentID, userPreviewID, bookmarkState) {
        return axios.put(urls.BOOKMARK_URL,
            {
                contentType,
                contentID,
                userPreviewID,
                bookmarkState
            })
    }

    static searchProject(pursuit, projectIDList, requestQuantity, submittingIndexUserID) {
        return axios.get(urls.SEARCH_PROJECT_URL, {
            params: {
                pursuit,
                projectIDList,
                requestQuantity,
                submittingIndexUserID
            }
        })
    }

    static returnUserPreviewByParam(obj) {
        return axios.get(urls.USER_PREVIEW_BASE_URL, { params: { ...obj } });
    }

    static searchBranches(indexUserID, requestQuantity) {
        return axios.get(urls.SEARCH_BRANCHES_URL, {
            params: {
                indexUserID,
                requestQuantity
            }
        });
    }
    // static saveTitle(payload) {
    //     return axios.put(urls.DRAFT_TITLE_URL, payload);
    // }

}

