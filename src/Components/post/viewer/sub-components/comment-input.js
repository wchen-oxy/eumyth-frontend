import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';

const CommentInput = (props) => (
    <TextareaAutosize
        ref={props.reference}
        className={props.classStyle}
        minRows={props.minRows}
        onChange={(e) => props.handleTextChange(e.target.value)}
        value={props.commentText}
        style={{ width: "120%" }}
    />
)
export default CommentInput;