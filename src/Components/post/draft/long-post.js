import React, { useState, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import LongEditor from '../editor/long-editor';
import SlateEditor from "../editor/slate-editor";
import ReviewPost from './review-post';
import {
  INITIAL_STATE,
  REVIEW_STATE,
  NONE,
  LONG,
  SHORT
} from "../../constants/flags";
import "./long-post.scss";
import _ from 'lodash';

// const  = (func) => _.debounce(func, 2000);

const LongPost = (props) => {
  const [windowState, setWindowState] = useState(INITIAL_STATE);
  const [hasContent, setHasContent] = useState(props.onlineDraft !== null || props.localDraft);
  const [previewTitle, setPreviewTitle] = useState(props.draftTitle);
  const editorContainerRef = useRef(null);
  const postHeaderRef = useRef(null);
  const dummyScrollRef = useRef(null);

  const syncChanges = () => {
    console.log("Sync HIT");
    console.log(props.updatingOnlineDraft);
    if (props.updatingOnlineDraft) return;
    // console.log(props.onLocalOnlineSync(props.localDraft));
    props.onLocalOnlineSync(props.localDraft)
      .then((result) => {
        if (result) {
          console.log("SAVING SIDE WAY");
          props.setSavePending(false);
        }
        else {
          alert("Save unsucessful");
        }
      });
  }

  const syncDebounce = _.debounce(() => { syncChanges() }, 130);


  const setPostStage = (windowType, isSavePending) => {
    if (isSavePending) {
      if (!window.confirm("Do you want to leave while changes are being saved?")) {
        syncChanges();
      }
      else {
        if (windowType === NONE) {
          props.onPostTypeSet(SHORT, null);
        }
        else {
          setWindowState(windowType);
        }
      }
    }
    else {
      switch (windowType) {
        case (NONE):
          props.onPostTypeSet(SHORT, props.localDraft);
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
          <div id="longpost-save-status-container">
            {props.isSavePending ? (<h4>Saving</h4>) : (<h4>Saved</h4>)}
          </div>
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
                onClick={syncDebounce}
              // onClick={() => syncDebounce(syncChanges)}

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

        {props.onlineDraftRetrieved && !props.loading ?
          (
            <div id="longpost-container">
              <div id="longpost-title-editor">
                <TextareaAutosize
                  id='textcontainer-text-input'
                  placeholder='Title'
                  onChange={(e) => {
                    setPreviewTitle(e.target.value);
                    // syncDebounce();
                  }}
                  minRows={1}
                  value={previewTitle}
                />
              </div>
              <SlateEditor />
              {/* <LongEditor
                username={props.username}
                isSavePending={props.isSavePending}
                hasContent={hasContent}
                setHasContent={setHasContent}
                onSavePending={props.setSavePending}
                onlineDraft={props.onlineDraft}
                localDraft={props.localDraft}
                setLocalDraft={props.setLocalDraft}
              /> */}
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
      <div id="longpost-review-window">
        <ReviewPost
          date={new Date().toISOString().substr(0, 10)}
          previousState={INITIAL_STATE}
          displayPhoto={props.displayPhoto}
          isPaginated={false}
          textData={props.onlineDraft}
          closeModal={props.closeModal}
          postType={LONG}
          setPostStage={setPostStage}
          username={props.username}
          preferredPostPrivacy={props.preferredPostPrivacy}
          pursuitNames={props.pursuitNames}
          handlePreferredPostPrivacyChange={props.handlePreferredPostPrivacyChange}
          progression={1}
          previewTitle={previewTitle}
        />
      </div>

    )
  }
}

export default LongPost;