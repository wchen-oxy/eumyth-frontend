import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { PROJECT } from 'utils/constants/flags';

const TitleInput = (props) => {

    return (
        <div>
            <label>Preview Title</label>
            <TextareaAutosize
                name='title'
                placeholder='Create an Optional Preview Title Text'
                value={props.title ? props.title : null}
                onChange={(e) => props.setTitle(e.target.value, true)}
                maxLength={100}
            />
            {props.postType === PROJECT &&
                <TextareaAutosize
                    name='subtitle'
                    id='review-post-text'
                    placeholder='Create an Optional Description'
                    onChange={(e) => props.setSubtitle(e.target.value,)}
                    maxLength={140} />
            }

        </div>
    );
}


export default TitleInput;