import { BUCKET_NAME, REGION, TEMP_PROFILE_PHOTO_URL } from './constants/urls';

const returnPostURL = (post) => ('/p/' + post);
const returnProjectURL = (project) => ('/c/' + project);
const returnUsernameURL = (username) => ('/u/' + username);
const returnUserImageURL = (key) => key ? ('http://' + BUCKET_NAME + '.s3.' + REGION + '.amazonaws.com/' + key) : TEMP_PROFILE_PHOTO_URL;
const returnUsernameObject = (username) => {
    return {
        params: {
            username: username
        }
    }
};

export {
    returnUsernameObject,
    returnUsernameURL,
    returnUserImageURL,
    returnPostURL,
    returnProjectURL,
}