import React, { useState, useRef, useEffect } from 'react';
import LongEditor from '../editor/long-editor';
import ReviewPost from './review-post';
import {
  INITIAL_STATE,
  REVIEW_STATE,
  NONE,
  LONG
} from "../../constants/flags";
import "./long-post.scss";
import _ from 'lodash';

const LongPost = (props) => {
  const [windowState, setWindowState] = useState(INITIAL_STATE);
  const [hasContent, setHasContent] = useState(props.onlineDraft !== null);
  const [previewTitle, setPreviewTitle] = useState(null);
  const editorContainerRef = useRef(null);
  const postHeaderRef = useRef(null);
  const dummyScrollRef = useRef(null);

  const syncChanges = () => {
    props.onLocalOnlineSync(props.localDraft)
      .then((result) => {
        if (result) {
          console.log("SAVING SIDE WAY");
          props.setSavePending(false);
        }
        else {
          alert("Save unsucessful");
        }
      }
      );
  }

  const setPostStage = (windowType, isSavePending) => {
    if (isSavePending) {
      if (!window.confirm("Do you want to leave while changes are being saved?")) {
        syncChanges();
      }
      else {
        if (windowType === NONE) {
          props.onPostTypeSet(windowType, null);
        }
        else {
          setWindowState(windowType);
        }
      }
    }
    else {
      switch (windowType) {
        case (NONE):
          props.onPostTypeSet(windowType, props.localDraft);
          break;
        case (INITIAL_STATE):
          setWindowState(windowType);
          break;
        case (REVIEW_STATE):
          const possibleTitle = props.localDraft.blocks[0].text;
          setWindowState(windowType);
          setPreviewTitle(possibleTitle);
          props.onLocalSync(props.localDraft);
          break;
        default:
          throw new Error("No Windows Matched");
      }
    }
  }
  if (windowState === INITIAL_STATE)
    return (
      <div
        className="longpost-window"
        ref={editorContainerRef}>
        <div ref={postHeaderRef}>
          {props.isSavePending ? (<p>Saving</p>) : (<p>Saved</p>)}
          <div className="longpost-button-container">
            <span  >
              <button
                value={NONE}
                onClick={e => setPostStage(e.target.value, props.isSavePending)}
              >
                Return
                </button>
            </span>
            <span  >
              <button
                value={NONE}
                onClick={syncChanges}
              >
                Save Now
                </button>
            </span>
            <span  >
              <button
                value={REVIEW_STATE}
                disabled={!hasContent}
                onClick={(e) => setPostStage(e.target.value, props.isSavePending)}
              >
                Review Post
              </button>
            </span>
          </div>
        </div>

        <div id="longpost-title-editor">
          {/* <textarea /> */}
        </div>
        {props.onlineDraftRetrieved && !props.loading ?
          (
            <div id="longpost-container">
              <LongEditor
                username={props.username}
                isSavePending={props.isSavePending}
                hasContent={hasContent}
                setHasContent={setHasContent}
                onSavePending={props.setSavePending}
                onlineDraft={props.onlineDraft}
                localDraft={props.localDraft}
                syncChanges={syncChanges}
                setLocalDraft={props.setLocalDraft}
              />
              <br />
              <br />
              <br />
              <br />
              <div ref={dummyScrollRef}></div>
            </div>

          )
          : (
            <div>
              <p> Loading.... </p>
            </div>
          )
        }

      </div>
    );
  else {
    return (
      <ReviewPost
         previousState={INITIAL_STATE}
        displayPhoto={props.displayPhoto}
        isPaginated={false}
        textData={props.onlineDraft}
        closeModal={props.closeModal}
        postType={LONG}
        setPostStage={setPostStage}
        username={props.username}
        preferredPostType={props.preferredPostType}
        pursuitNames={props.pursuitNames}
        handlePreferredPostTypeChange={props.handlePreferredPostTypeChange}
        previewTitle={previewTitle}
      />
    )
  }
}

export default LongPost;