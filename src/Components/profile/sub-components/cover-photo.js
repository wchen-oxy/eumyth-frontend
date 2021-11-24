import React from 'react';
import { returnUserImageURL } from 'utils/url';
import './cover-photo.scss';

const CoverPhoto = (props) => {
    if (props.coverPhotoKey) {
        return (<img
            alt='cover photo'
            src={returnUserImageURL(
                props.coverPhotoKey)}
        ></img>
        )
    }
    else {
        return (
            <div id='coverphoto-temp-cover'></div>
        )
    }
}

export default CoverPhoto;