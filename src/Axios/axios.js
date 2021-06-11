import axios from 'axios';
import { COVER } from '../Components/constants/flags';
import urls from "../Components/constants/urls";

export default class AxiosHelper {

    static changeRelationStatus(action, targetUsername, currentUsername, ID) {
        return axios.put(urls.RELATION_SET_FOLLOWER_URL, {
            action: action,
            targetUsername: targetUsername,
            currentUsername: currentUsername,
            ID: ID
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

    static deletePost(userID, indexUserID, postID, pursuit, duration, progression) {
        return axios.delete(urls.POST_BASE_URL, {
            data: {
                userID: userID,
                indexUserID: indexUserID,
                postID: postID,
                pursuit: pursuit,
                duration: duration,
                progression: progression
            }
        });
    }

    static getUserPreviewID(username) {
        return axios.get(urls.USER_PREVIEW_ID_URL, urls.returnUsernameObject(username));
    }

    static returnUserRelationInfo(username) {
        return axios.get(urls.RELATION_INFO_URL, urls.returnUsernameObject(username));
    }

    static returnTinyDisplayPhoto(username) {
        return axios.get(urls.TINY_DISPLAY_PHOTO_URL, urls.returnUsernameObject(username))
    }

    static setProfilePrivacy(username, isPrivate) {
        return axios.put(urls.USER_PRIVACY, {
            username: username,
            isPrivate: isPrivate
        });
    }

    static setFollowerStatus(
        visitorUsername,
        userRelationArrayID,
        targetProfilePreviewID,
        isPrivate,
        action) {
        return axios.put(urls.RELATION_STATUS_URL,
            {
                visitorUsername: visitorUsername,
                userRelationArrayID: userRelationArrayID,
                targetProfilePreviewID: targetProfilePreviewID,
                isPrivate: isPrivate,
                action: action
            }
        );
    }

    // static setDraftPreviewTitle(previewTitle) {
    //     return axios.post(urls.DRAFT_BASE_URL, { previewTitle: previewTitle });
    // }

    // static returnPursuitNames(username) {
    //     return axios.get(urls.INDEX_USER_PURSUITS_URL, urls.returnUsernameObject(username));
    // }

    static returnIndexUser(username) {
        return axios.get(urls.INDEX_BASE_URL, urls.returnUsernameObject(username))
    }

    static returnUser(username) {
        return axios.get(urls.USER_BASE_URL, urls.returnUsernameObject(username));
    }

    static returnFollowerStatus(visitorUsername, userRelationArrayID) {
        return axios.get(urls.RELATION_BASE_URL, {
            params: {
                visitorUsername: visitorUsername,
                userRelationArrayID: userRelationArrayID,
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

    static returnMultiplePostInfo(targetUserDataID, postIDList) {
        return axios.get(urls.MULTIPLE_POSTS_URL, {
            params: {
                targetUserDataID: targetUserDataID,
                postIDList: postIDList
            }
        })
    }

    static returnMultiplePosts(postIDList, includePostText) {
        console.log(postIDList);
        return axios.get(urls.MULTIPLE_POSTS_URL, {
            params: {
                postIDList: postIDList,
                includePostText: includePostText
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
        return axios.get(urls.USER_ACCOUNT_SETTINGS_INFO_URL, urls.returnUsernameObject(username))
    }

    static updateBio(bio, username) {
        return axios.put(urls.USER_BIO_URL, {
            bio: bio,
            username: username,
        });
    }

    static updatePost(postInfoForm) {
        return axios.put(urls.POST_BASE_URL, postInfoForm);
    }

    static updateAccountImage(formData, photoType) {
        return axios.post(photoType === "COVER" ? urls.COVER_PHOTO_URL : urls.DISPLAY_PHOTO_URL, formData)
    }

    static getComments(rootCommentIDArray, viewingMode) {
        return axios.get(urls.COMMENT_BASE_URL, {
            params: {
                rootCommentIDArray: rootCommentIDArray,
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

    static retrieveNewPostInfo(username) {
        return axios.get(urls.DRAFT_BASE_URL, urls.returnUsernameObject(username))
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

    static saveDraft(username, draft) {
        return axios.put(urls.DRAFT_BASE_URL,
            {
                username: username,
                draft: JSON.stringify(draft),
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

    // static saveTitle(payload) {
    //     return axios.put(urls.DRAFT_TITLE_URL, payload);
    // }

}

