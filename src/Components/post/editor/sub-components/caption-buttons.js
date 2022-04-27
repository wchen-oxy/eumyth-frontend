import React from 'react';

const CaptionButtons = props => {
    if (props.isPaginated) return (
        <button title="Discard All Captions Except For the First Image" onClick={props.onPaginatedChange}>
            Return to Single Caption
        </button>
    )
    else {
        return (
            <button title="Click to Caption Each Image Individually" onClick={props.onPaginatedChange}>
                Caption Photos Individually
            </button>
        )
    }
}

export default CaptionButtons;