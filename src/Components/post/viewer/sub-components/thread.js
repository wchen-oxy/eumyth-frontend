import React from "react";
import { toTitleCase } from "utils";
import { returnProjectURL } from 'utils/url'

const Thread = (props) => {
    return (
        <div className="thread">
            <h2>{(props.pursuit).toUpperCase()}
            </h2>
            <h4>|</h4>

            {props.projectPreview &&
                <a href={returnProjectURL(props.projectPreview.project_id)}>
                    {props.projectPreview.title}
                </a>}
        </div>
    )
}

export default Thread;