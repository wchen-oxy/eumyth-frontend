import React from 'react';
import { PROJECT } from '../../../constants/flags';
import TextareaAutosize from 'react-textarea-autosize';

const TitleInput = (props) => {

    return (
        <div>
            <label>Preview Title</label>
            <TextareaAutosize
                name="title"
                placeholder='Create an Optional Preview Title Text'
                value={props.title ? props.title : null}
                onChange={(e) => props.setTitle(e.target.value)}
                maxLength={100}
            />
            {props.postType === PROJECT ?
                <TextareaAutosize
                    name="subtitle"
                    id='review-post-text'
                    placeholder='Create an Optional Description'
                    onChange={(e) => props.setSubtitle(e.target.value)}
                    maxLength={140} /> : null}

        </div>
    );
}


export default TitleInput;