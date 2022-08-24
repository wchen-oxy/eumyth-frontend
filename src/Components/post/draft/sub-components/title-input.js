import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { PROJECT } from 'utils/constants/flags';

const TitleInput = (props) => {
    return (
        <div id='titleinput'>
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
            {props.postType === PROJECT &&
                <TextareaAutosize
                    name='subtitle'
                    id='titleinput-text'
                    placeholder='Create an Optional Description'
                    onChange={(e) => props.setSubtitle(e.target.value,)}
                    minRows={2}
                    maxLength={140} />
            }
        </div>
    );
}


export default TitleInput;