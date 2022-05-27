import React from "react";
import { returnProjectURL } from '../../../../utils/url'
import { displayDifficulty, displayProgressionType } from "utils/constants/ui-text";
import EventLabels from "components/timeline/sub-components/event-labels";
import "./short-post-meta.scss";

const ShortPostMetaInfo = (props) => {
    const progression = displayProgressionType(props.progression);
    const difficulty = displayDifficulty(props.difficulty);


    return (
        <div>
            <div className="shortpostmetainfo-thread-container">
                <p>{props.pursuit} | <span>
                    {props.projectPreview &&
                        <a href={returnProjectURL(props.projectPreview.project_id)}>{props.projectPreview.title}</a>}
                </span></p>
            </div>
            <div className="shortpostmetainfo-stat-container">
                {progression && <p>{progression} Progress</p>}
                {difficulty && <p>{difficulty} Difficulty</p>}
                {props.min && <p>{props.min} minutes</p>}
                {(props.labels?.length ?? 0) > 0 &&
                    <EventLabels
                        isFullPage={props.isFullPage}
                        labels={props.labels} />}
            </div>

        </div>
    )
}

export default ShortPostMetaInfo;