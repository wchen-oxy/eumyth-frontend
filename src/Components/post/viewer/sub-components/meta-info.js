import React from "react";
import { displayDifficulty } from "utils/constants/ui-text";
import EventLabels from "components/timeline/sub-components/event-labels";

const MetaInfo = (props) => {
 
    
    const difficulty = displayDifficulty(props.difficulty);
    if (!props.isMetaToggled) return null;
    return (
        <div>
         
            <div className="metainfo-stat">
                {/* {!props.isLargeViewMode &&
                    <div className="metainfo-stat-inner metainfo-right-border">
                        <p>Date</p>
                        {date && <h4>{date.month}, {date.day}, {date.year} </h4>}
                    </div>} */}

                <div className="metainfo-stat-inner metainfo-right-border">
                    <p>Difficulty</p>
                    <h4> {difficulty ? difficulty : "-.-"}</h4>
                </div>

                <div className="metainfo-stat-inner metainfo-right-border">
                    <p>Minutes</p>
                    <h4> {props.minDuration ? props.minDuration : "-.-"}</h4>
                </div>
                <div className="metainfo-stat-inner">
                    <p>Labels</p>
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