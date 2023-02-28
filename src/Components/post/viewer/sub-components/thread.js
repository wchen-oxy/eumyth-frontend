import React from "react";
import { toTitleCase } from "utils";
import { returnProjectURL } from 'utils/url'

const Thread = (props) => {
    return (
        <div className="thread">
            <p>{toTitleCase(props.pursuit)} | <span>
                {props.projectPreview &&
                    <a href={returnProjectURL(props.projectPreview.project_id)}>
                        {props.projectPreview.title}
                    </a>}
            </span></p>
        </div>
    )
}

export default Thread;