import React from "react";

const PhotoContainer = (props) => {
    const labels = {
        DISPLAY: {
            title: 'Display Photo',
            edit: 'Edit Display Photo',
            select: 'Select Display Photo',
            submit: 'Submit Display Photo',
            remove: 'Remove Display Photo'
        },
        COVER: {
            title: 'Cover Photo',
            edit: 'Edit Cover Photo',
            select: 'Select Cover Photo',
            submit: 'Submit Cover Photo',
            remove: 'Remove Cover Photo'
        }
    }

    return (
        <div>
            <label>{labels[props.type].title}</label>
            <button onClick={() => {
                props.setIsEditingPhoto(!props.isEditing)
                props.showPhotoEditor(props.photoRef)
            }}>
                {props.isEditing ? 'Cancel' : labels[props.type].edit}
            </button>
            <div ref={props.photoRef} className='account-photo-edit-container'>
                <div className='account-photo-inner-container'>
                    <p>{labels[props.type].select}</p>
                    <input
                        type='file'
                        onChange={(e) => {
                            props.setPhoto(e.target.files[0]);
                        }} />
                    {props.photoExists && props.type !== 'COVER' && props.profilePhotoEditor}
                    <button
                        disabled={!props.photoExists}
                        onClick={() => props.submitPhoto(props.type)}>
                        {labels[props.type].submit}
                    </button>
                </div>
                <div className='account-photo-inner-container'>
                    <p>{labels[props.type].remove}</p>
                    <button onClick={() => props.removePhoto(props.type)}>
                        {labels[props.type].remove}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PhotoContainer;