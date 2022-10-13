import React from "react";
import { returnProjectURL } from '../../../../utils/url'
import { displayDifficulty, displayProgressionType } from "utils/constants/ui-text";
import EventLabels from "components/timeline/sub-components/event-labels";

const MetaInfo = (props) => {
    const difficulty = displayDifficulty(props.difficulty);

    return (
        <div>
            <div className="metainfo-thread">
                <p>{props.pursuit} | <span>
                    {props.projectPreview &&
                        <a href={returnProjectURL(props.projectPreview.project_id)}>
                            {props.projectPreview.title}
                        </a>}
                </span></p>
            </div>
            <div className="metainfo-stat">
                {/* {progression && <p>{progression} Progress</p>} */}
                <div className="metainfo-stat-inner metainfo-right-border">
                    <p>Difficulty</p>
                    <h4> {difficulty ? difficulty : "-.-"}</h4>
                </div>


                <div className="metainfo-stat-inner metainfo-right-border">
                    <p>Minutes</p>
                    <h4> {props.minDuration ? props.minDuration : "-.-"}</h4>
                </div>
                <div className="metainfo-stat-inner">
                    {(props.labels?.length ?? 0) > 0 &&
                        <EventLabels
                            isFullPage={props.isFullPage}
                            labels={props.labels} />}
                </div>
            </div>
        </div>
    )
}

export default MetaInfo;