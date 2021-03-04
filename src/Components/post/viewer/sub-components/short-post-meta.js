import React from "react";
import "./short-post-meta.scss";

const ShortPostMetaInfo = (props) => {
    return (
        <div>
            <div className="shortpostmetainfo-container">
                {props.isMilestone ? <p>Milestone :)</p> : <></>}
                {props.pursuit ? <p>{props.pursuit}</p> : <></>}
                {props.min ? <p>{props.min} minutes</p> : <></>}
            </div>
            <p>{props.isPaginated && props.textData ?
                props.textData[props.index] : props.textData}</p>
        </div>
    )
}

export default ShortPostMetaInfo;