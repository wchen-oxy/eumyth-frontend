import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import './text-container.scss';

const TextContainer = (props) => (
    <div className='textcontainer-main-container'>
        <h4>{props.username}</h4>
        {props.validFilesLength > 1 &&
            props.isPaginated ? (
            <button onClick={props.onPaginatedChange}>
                Return to Single Caption
            </button>
        ) : (
            <button onClick={props.onPaginatedChange}>
                Caption Photos Individually
            </button>
        )}

        <TextareaAutosize
            id='textcontainer-text-input'
            placeholder='Write something here.'
            onChange={(e) => props.onTextChange(e.target.value)}
            minRows={10}
            value={
                props.isPaginated ?
                    props.textPageText[props.imageIndex] :
                    props.textPageText
            }
        />
        <p>{props.validFilesLength > 1 ? props.imageIndex + 1 : null}</p>
    </div>
);

export default TextContainer;