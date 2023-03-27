import React from 'react';

const EventPreview = (props) => {
    if (props.isImage) {
        return (
            <div className='eventpreview-image-container'>
                <img
                    alt='short event cover'
                    className='eventpreview-image'
                    src={props.image} />
            </div>
        )
    }
    else if (props.isText) {
        return (
            <div className='eventpreview-snippet-container'>
                <p>{props.snippet}</p>
            </div>
        )
    }
}

export default EventPreview;