import React from 'react';
import AvatarEditor from 'react-avatar-editor';
import Dropzone from 'react-dropzone';

const ProfilePhotoEditor = (props) => {
    const handleDefaultBehavior = (event, defaultValue, method) => {
        event.preventDefault();
        method(defaultValue);
    }
    return (<>
        <Dropzone
            onDrop={props.handleImageDrop}
            noClick
            noKeyboard
            style={{ width: '200px', height: '200px' }}
        >
            {({ getRootProps, getInputProps }) => (
                <div {...getRootProps()}>
                    <AvatarEditor
                        ref={props.setEditorRef}
                        image={props.profilePhoto}
                        width={170}
                        height={170}
                        borderRadius={200}
                        border={50}
                        color={[215, 215, 215, 0.8]} // RGBA
                        scale={props.imageScale}
                        rotate={props.imageRotation}
                    />
                    <input {...getInputProps()} />
                </div>
            )}
        </Dropzone>
        <button onClick={(e) => handleDefaultBehavior(e, null, props.clearFile)}
        >Clear file</button>
        <label>Rotation</label>
        <input
            type="range"
            id="points"
            name="points"
            min="-180"
            max="180"
            value={props.imageRotation}
            onChange={(e) => props.rotateImage(e.target.value)} />
        <button onClick={(e) => handleDefaultBehavior(e, 0, props.rotateImage)}>Reset</button>
        <label>Scale</label>
        <input
            type="range"
            id="points"
            name="points"
            step="0.1"
            min="1"
            max="10"
            value={props.imageScale}
            onChange={(e) => props.scaleImage(e.target.value)}
        />
        <button onClick={(e) => handleDefaultBehavior(e, 1, props.scaleImage)}>
            Reset
            </button>
    </>
    )
}
export default ProfilePhotoEditor;