import React from 'react';

const CaptionButtons = props => {
    if (props.isPaginated) return (
        <button onClick={props.onPaginatedChange}>
            Return to Single Caption
        </button>
    )
    else {
        return (
            <button onClick={props.onPaginatedChange}>
                Caption Photos Individually
            </button>
        )
    }
}

export default CaptionButtons;