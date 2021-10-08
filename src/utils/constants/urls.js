//AWS
const BUCKET_NAME = 'eumyth-bucket-1';
const REGION = 'us-west-1';

//Temporary Profile Photo
const TEMP_PROFILE_PHOTO_URL = 'https://qph.fs.quoracdn.net/main-qimg-2b21b9dd05c757fe30231fac65b504dd';

// const ROOT_URL = '//localhost:5000/api';
// const apiUrl = process.env.NODE_ENV === 'production'
//     ? process.env.REACT_APP_PROD_API_URL : process.env.REACT_APP_DEV_API_URL;
// const ROOT_URL = '//localhost:5000:' + apiUrl;
const ROOT_URL = '/api';

const DRAFT_BASE_URL = ROOT_URL + '/draft';
const DRAFT_TITLE_URL = DRAFT_BASE_URL + '/title';

//image
const IMAGE_BASE_URL = ROOT_URL + '/image';
const MULTIPLE_IMAGES_URL = IMAGE_BASE_URL + '/multiple';
const DISPLAY_PHOTO_URL = IMAGE_BASE_URL + '/display-photo';
const COVER_PHOTO_URL = IMAGE_BASE_URL + '/cover';
const TINY_DISPLAY_PHOTO_URL = IMAGE_BASE_URL + '/navbar-display-photo';
const COMPRESS_PHOTO_URL = IMAGE_BASE_URL + '/compress';

//user
const USER_BASE_URL = ROOT_URL + '/user';
const USER_BIO_URL = USER_BASE_URL + '/bio';
const USER_ACCOUNT_SETTINGS_INFO_URL = USER_BASE_URL + '/account-settings-info';
const USER_PRIVACY_URL = USER_BASE_URL + '/private';
const USER_TEMPLATE_URL = USER_BASE_URL + '/template';

//UserPreview
const USER_PREVIEW_BASE_URL = ROOT_URL + '/user-preview';
const USER_PREVIEW_ID_URL = USER_PREVIEW_BASE_URL + '/id';


//relation
const RELATION_BASE_URL = ROOT_URL + '/relation';
const RELATION_STATUS_URL = RELATION_BASE_URL + '/status';
const RELATION_INFO_URL = RELATION_BASE_URL + '/info';
const RELATION_SET_FOLLOWER_URL = RELATION_BASE_URL + '/set';


//post
const POST_BASE_URL = ROOT_URL + '/post';
const MULTIPLE_POSTS_URL = POST_BASE_URL + '/multiple';

const WITH_IMAGE_POST_URL = POST_BASE_URL + '/with-image';
const NO_IMAGE_POST_URL = POST_BASE_URL + '/no-image';
const SOCIAL_FEED_POSTS_URL = POST_BASE_URL + '/feed';
const POST_DISPLAY_PHOTO_URL = POST_BASE_URL + '/display-photo';
const SINGLE_POST_TEXT_DATA_URL = POST_BASE_URL + '/single'

//project
const PROJECT_BASE_URL = ROOT_URL + '/project';
const SINGLE_PROJECT_URL = PROJECT_BASE_URL + '/single';
const MULTIPLE_PROJECTS_URL = PROJECT_BASE_URL + '/multiple';
const PROJECT_FORK_URL = PROJECT_BASE_URL + '/fork';

//pursuits
const PURSUITS_BASE_URL = ROOT_URL + '/pursuit';
const ALL_POSTS = PURSUITS_BASE_URL + '/all-posts';

//index
const INDEX_BASE_URL = ROOT_URL + '/index-user';
const CHECK_USERNAME_URL = INDEX_BASE_URL + '/username';
const INDEX_USER_PURSUITS_URL = INDEX_BASE_URL + '/pursuits';

//comment
const COMMENT_BASE_URL = ROOT_URL + '/comment';
const ROOT_COMMENT_URL = COMMENT_BASE_URL + '/root';
const REPLY_COMMENT_URL = COMMENT_BASE_URL + '/reply';
const REFRESH_COMMENTS_URL = COMMENT_BASE_URL + '/refresh';
const VOTE_ON_COMMENT_URL = COMMENT_BASE_URL + '/vote';

module.exports = {
    BUCKET_NAME,
    REGION,
    TEMP_PROFILE_PHOTO_URL,
    ROOT_URL,
    ALL_POSTS,
    IMAGE_BASE_URL,
    MULTIPLE_IMAGES_URL,
    DISPLAY_PHOTO_URL,
    COVER_PHOTO_URL,
    DRAFT_BASE_URL,
    DRAFT_TITLE_URL,
    TINY_DISPLAY_PHOTO_URL,
    COMPRESS_PHOTO_URL,
    USER_BASE_URL,
    USER_BIO_URL,
    USER_ACCOUNT_SETTINGS_INFO_URL,
    USER_PRIVACY_URL,
    USER_PREVIEW_BASE_URL,
    USER_PREVIEW_ID_URL,
    USER_TEMPLATE_URL,
    RELATION_BASE_URL,
    RELATION_STATUS_URL,
    RELATION_INFO_URL,
    RELATION_SET_FOLLOWER_URL,
    POST_BASE_URL,
    PROJECT_BASE_URL,
    PROJECT_FORK_URL,
    SINGLE_PROJECT_URL,
    MULTIPLE_PROJECTS_URL,
    MULTIPLE_POSTS_URL,
    WITH_IMAGE_POST_URL,
    NO_IMAGE_POST_URL,
    SOCIAL_FEED_POSTS_URL,
    POST_DISPLAY_PHOTO_URL,
    SINGLE_POST_TEXT_DATA_URL,
    INDEX_BASE_URL,
    CHECK_USERNAME_URL,
    INDEX_USER_PURSUITS_URL,
    COMMENT_BASE_URL,
    ROOT_COMMENT_URL,
    REPLY_COMMENT_URL,
    REFRESH_COMMENTS_URL,
    VOTE_ON_COMMENT_URL
}