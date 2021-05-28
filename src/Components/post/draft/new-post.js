import React from 'react';
import { SHORT, NEW_LONG, OLD_LONG } from "../../constants/flags";
import "./new-post.scss";

const NewPost = (props) => {
    const handleClick = (e) => {
        !!props.onlineDraft ? (
            window.confirm(`Starting a new Long Post will
                            erase your saved draft. Continue anyway?`)
            && props.onPostTypeSet(e.target.value)
        ) : (
                props.onPostTypeSet(e.target.value));
    }
    return (
        <div id="newpost-window">
            <div className="newpost-button-container">
                <h3>Document Your Progress</h3>
                <h4>Make a Normal Post</h4>
                <button
                    value={SHORT}
                    onClick={(e) => props.onPostTypeSet(e.target.value)}
                >
                    New Normal Post
                </button>
                <h4>Make an Essay Post</h4>
                <button
                    value={NEW_LONG}
                    onClick={(e) => handleClick(e.target.value)}
                >
                    New Draft
                </button>
                <button
                    value={OLD_LONG}
                    onClick={(e) => props.onPostTypeSet(e.target.value)}
                >
                    Continue Previous Draft?
                     </button>
            </div>
        </div>
    )
}

export default NewPost;