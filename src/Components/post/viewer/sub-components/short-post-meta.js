import React from "react";
import { displayProgressionType } from "../../../constants/ui-text";
import "./short-post-meta.scss";


const ShortPostMetaInfo = (props) => {
    return (
        <div>
            <div className="shortpostmetainfo-stat-container">
                {props.progression ? <p>{displayProgressionType(props.progression)}</p> : <></>}
                {props.pursuit ? <p>{props.pursuit}</p> : <></>}
                {props.min ? <p>{props.min} minutes</p> : <></>}
                {props.labels ? <p>{props.labels.map(value => value + " ")}</p> : <></>}
            </div>
            <div className="shortpostmetainfo-text-container">
                <p>{props.isPaginated && props.textData ?
                    props.textData[props.index] : props.textData}</p>
            </div>
        </div>
    )
}

export default ShortPostMetaInfo;