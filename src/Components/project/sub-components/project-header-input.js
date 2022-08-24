import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';

const ProjectHeaderInput = (props) => {
    return (
        <div id='projectheaderinput-header'>
            <TextareaAutosize
                id='projectheaderinput-title'
                placeholder='Write a Title for your Post!'
                maxLength={140}
                onChange={(e) => props.onTextChange('TITLE', e.target.value)}
                value={props.titleValue}
            />
            <TextareaAutosize
                id='projectheaderinput-overview'
                placeholder='Write an Overview for your Project!'
                maxLength={140}
                onChange={(e) => props.onTextChange('OVERVIEW', e.target.value)}
                value={props.descriptionValue}
            />
        </div>
    );

}

export default ProjectHeaderInput;
