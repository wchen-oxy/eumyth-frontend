import React from 'react';
import { SHORT } from '../../../constants/flags';

const CoverPhotoControls = (props) => {
    if (props.postType === SHORT) {
        const allowCoverPhoto = props.isUpdateToPost || !props.isUpdateToPost && props.imageArray;
        return (
            allowCoverPhoto &&
            (<div>
                <label>Use First Image For Thumbnail</label>
                <input
                    type="checkbox"
                    defaultChecked={props.useImageForThumbnail}
                    onChange={() => {
                        props.setUseImageForThumbnail(!props.useImageForThumbnail)
                    }
                    }
                />
            </div>)
        )

    }
    else {
        throw new Error("No Post Types Matched for Cover Photo Controls");
    }
}

export default CoverPhotoControls;