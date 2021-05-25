import React from "react";
import "./short-post-meta.scss";

const ShortPostMetaInfo = (props) => {
    return (
        <div>
            <div className="shortpostmetainfo-stat-container">
                {props.progression ? <p>Milestone :)</p> : <></>}
                {props.pursuit ? <p>{props.pursuit}</p> : <></>}
                {props.min ? <p>{props.min} minutes</p> : <></>}
            </div>
            <div className="shortpostmetainfo-text-container">
                <p>{props.isPaginated && props.textData ?
                    props.textData[props.index] : props.textData}</p>
            </div>
        </div>
    )
}

export default ShortPostMetaInfo;