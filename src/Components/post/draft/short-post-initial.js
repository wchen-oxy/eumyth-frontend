import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import ShortEditor from '../editor/short-editor';
import Steps from './sub-components/steps';

const ShortPostInitial = (props) => {
  return (<div 
  id='shortpostinitial' 
  className='draft-window'
  >
    <h2 id="shortpostinitial-title">Short Post</h2>
    {props.isCompressing && <p>Compressing Photos</p>}
    <div className='shortpostinitial-nav'>
      <button onClick={props.onModalClose}>
        Discard
      </button>
      <Steps current={props.window} />
      <button
        value={2}
        disabled={props.isPostDisabled}
        onClick={e => props.setPostStage(e.target.value)}
      >
        Review Meta
      </button>
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
  );
}

export default ShortPostInitial;