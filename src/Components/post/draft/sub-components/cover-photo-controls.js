import React from 'react';
import { SHORT } from 'utils/constants/flags';
import './cover-photo-controls.scss';

const CoverPhotoControls = (props) => {
    if (props.postType === SHORT) {
        const allowCoverPhoto = props.isUpdateToPost || !props.isUpdateToPost && props.imageArray;
        return (
            allowCoverPhoto &&
            (<div id='coverphotocontrols-main'>
                <label>Use First Image For Thumbnail</label>
                <input
                    type='checkbox'
                    id='coverphotocontrols-content'
                    defaultChecked={props.useImageForThumbnail}
                    onChange={() => {
                        props.setUseImageForThumbnail(!props.useImageForThumbnail)
                    }}
                />
            </div>)
        )

    }
    else {
        throw new Error('No Post Types Matched for Cover Photo Controls');
    }
}

export default CoverPhotoControls;