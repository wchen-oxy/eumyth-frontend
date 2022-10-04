import React from 'react';

const CoverPhotoControls = (props) => {
    const allowCoverPhoto = props.isUpdateToPost || !props.isUpdateToPost && props.imageArray;
    return (
        allowCoverPhoto &&
        (<div className='btn-meta'>
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

export default CoverPhotoControls;