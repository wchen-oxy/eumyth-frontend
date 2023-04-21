import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import ShortEditor from '../editor/short-editor';
import Steps from './sub-components/steps';

const ShortPostInitial = (props) => {
  const reviewClassName = props.isPostDisabled
    ? 'shortpostinitial-nav-button-disabled' : 'shortpostinitial-nav-button-enabled';
  return (
    <div
      id='shortpostinitial'
      className='draft-window'
    >
      <div id='shortpostinitial-contents'>

        <h2 id="shortpostinitial-title">Short Post</h2>
        {props.isCompressing && <p>Compressing Photos</p>}
        <div
          className='shortpostinitial-nav'>
          <div id='shortpostinitial-discard'>
            <button
              className='shortpostinitial-nav-button-enabled'
              onClick={props.onModalClose}
            >
              Discard
            </button>
          </div>

          <Steps current={props.window} />
          <div id='shortpostinitial-review'>
            <button
              className={reviewClassName}
              value={2}
              disabled={props.isPostDisabled}
              onClick={e => props.setPostStage(e.target.value)}
            >
              Review Meta
            </button>
          </div>
        </div>
        <div id='shortpostinitial-title'>
          <TextareaAutosize
            id='shortpostinitial-input'
            placeholder='Title'
            onChange={(e) => props.editorFunctions.onTextChange(e.target.value, true)}
            minRows={2}
            value={props.previewTitle} />
        </div>
        <ShortEditor
          isPaginated={props.isPaginated}
          {...props.editorFunctions}
          {...props.editorStates}
        />

      </div>
    </div>
  );
}

export default ShortPostInitial;