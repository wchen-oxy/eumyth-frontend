import React from "react";
import { displayDifficulty, displayProgressionType } from "utils/constants/ui-text";
import EventLabels from "components/timeline/sub-components/event-labels";
import "./short-post-meta.scss";

const ShortPostMetaInfo = (props) => {
    return (
        <div>
            <div className="shortpostmetainfo-stat-container">
                {props.progression ? <p>{displayProgressionType(props.progression)}</p> : <></>}
                {props.difficulty ? <p>{displayDifficulty(props.difficulty)}</p> : null}
                {props.pursuit ? <p>{props.pursuit}</p> : <></>}
                {props.min ? <p>{props.min} minutes</p> : <></>}
                {(props.labels?.length ?? 0) > 0 &&
                    <EventLabels
                        isFullPage={props.isFullPage}
                        labels={props.labels} />}
            </div>
            <div className="shortpostmetainfo-text-container">
                <p>{props.isPaginated && props.textData ?
                    props.textData[props.index] : props.textData}</p>
            </div>
        </div>
    )
}

export default ShortPostMetaInfo;