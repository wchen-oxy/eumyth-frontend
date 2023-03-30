import React from 'react';

const CaptionButtons = props => {
    if (props.isPaginated) return (
        <button
            className='captionbuttons'
            title="Discard All Captions Except For the First Image"
            onClick={props.onPaginatedChange}>
            Return to Single Caption
        </button>
    )
    else {
        return (
            <button
                className='captionbuttons'
                title="Click to Caption Each Image Individually"
                onClick={props.onPaginatedChange}>
                Caption Photos Individually
            </button>
        )
    }
}

export default CaptionButtons;