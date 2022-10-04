import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';

const TitleInput = (props) => {
    return (
        <div className='btn-meta'>
            <label>Post Title</label>
            <TextareaAutosize
                name='title'
                id='titleinput-text'
                placeholder='Create an Optional Title Text'
                value={props.title ? props.title : null}
                onChange={(e) => props.setTitle(e.target.value, true)}
                minRows={2}
                maxLength={100}
            />
        </div>
    );
}


export default TitleInput;